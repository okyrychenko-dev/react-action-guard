import { type Optional, isArray, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { devtoolsStoreApi } from "../store";
import type { Middleware, MiddlewareContext } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsStoreApi } from "../store";

interface TrackedBlocker {
  timestamp: number;
  scope?: string | ReadonlyArray<string>;
}

const TERMINAL_ACTIONS = new Set<MiddlewareContext["action"]>([
  "remove",
  "timeout",
  "clear",
  "clear_scope",
]);

/**
 * Creates the devtools middleware that captures and records UI blocking events.
 *
 * @public
 * @see {@link ActionGuardDevtools} for automatic middleware registration
 */
export function createDevtoolsMiddlewareForStore(
  targetDevtoolsStore: DevtoolsStoreApi
): Middleware {
  // Track add timestamps for duration calculation
  const activeBlockers = new Map<string, TrackedBlocker>();

  const getDuration = (
    action: MiddlewareContext["action"],
    blockerId: string,
    timestamp: number
  ): Optional<number> => {
    if (!TERMINAL_ACTIONS.has(action)) {
      return undefined;
    }

    const trackedBlocker = activeBlockers.get(blockerId);

    if (isUndefined(trackedBlocker)) {
      return undefined;
    }

    activeBlockers.delete(blockerId);

    return timestamp - trackedBlocker.timestamp;
  };

  const clearScopedBlockers = (scope: string): void => {
    for (const [blockerId, trackedBlocker] of activeBlockers.entries()) {
      if (trackedBlocker.scope === scope) {
        activeBlockers.delete(blockerId);
        continue;
      }

      if (isArray(trackedBlocker.scope) && trackedBlocker.scope.includes(scope)) {
        activeBlockers.delete(blockerId);
      }
    }
  };

  const clearTrackedBlockers = (context: MiddlewareContext): void => {
    switch (context.action) {
      case "clear":
        activeBlockers.clear();
        break;
      case "clear_scope":
        if (isDefined(context.scope)) {
          clearScopedBlockers(context.scope);
        }
        break;
      default:
        break;
    }
  };

  return (context: MiddlewareContext): void => {
    const { addEvent } = targetDevtoolsStore.getState();

    // Track when blockers are added
    if (context.action === "add") {
      activeBlockers.set(context.blockerId, {
        timestamp: context.timestamp,
        scope: context.config?.scope,
      });
    }

    // Calculate duration for terminal events
    const duration = getDuration(context.action, context.blockerId, context.timestamp);

    clearTrackedBlockers(context);

    // Record the event
    addEvent({
      action: context.action,
      blockerId: context.blockerId,
      config: context.config,
      timestamp: context.timestamp,
      prevState: context.prevState,
      duration,
      scope: context.scope,
      count: context.count,
    });
  };
}

export function createDevtoolsMiddleware(): Middleware {
  return createDevtoolsMiddlewareForStore(devtoolsStoreApi);
}
