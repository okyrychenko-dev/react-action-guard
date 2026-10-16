import { DEFAULT_SCOPE, scopeMatchesTarget } from "@okyrychenko-dev/react-action-guard";
import { type Optional, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { devtoolsStoreApi } from "../store";
import type { Middleware, MiddlewareContext } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsStoreApi } from "../store";

interface TrackedBlocker {
  registration?: object;
  timestamp: number;
  scope?: string | ReadonlyArray<string>;
}

const TERMINAL_ACTIONS = new Set<MiddlewareContext["action"]>(["remove", "timeout"]);

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

  const registrations = new WeakMap<object, TrackedBlocker>();

  const getDuration = (
    action: MiddlewareContext["action"],
    blockerId: string,
    timestamp: number,
    registration?: object
  ): Optional<number> => {
    if (!TERMINAL_ACTIONS.has(action)) {
      return undefined;
    }

    let trackedBlocker = activeBlockers.get(blockerId);

    if (isDefined(registration)) {
      trackedBlocker = registrations.get(registration);
    }

    if (isUndefined(trackedBlocker)) {
      return undefined;
    }

    if (activeBlockers.get(blockerId) === trackedBlocker) {
      activeBlockers.delete(blockerId);
    }

    const { registration: trackedRegistration } = trackedBlocker;

    if (isDefined(trackedRegistration)) {
      registrations.delete(trackedRegistration);
    }

    return timestamp - trackedBlocker.timestamp;
  };

  const clearScopedBlockers = (scope: string): void => {
    for (const [blockerId, trackedBlocker] of activeBlockers.entries()) {
      if (scopeMatchesTarget(trackedBlocker.scope ?? DEFAULT_SCOPE, scope)) {
        activeBlockers.delete(blockerId);

        const { registration: trackedRegistration } = trackedBlocker;

        if (isDefined(trackedRegistration)) {
          registrations.delete(trackedRegistration);
        }
      }
    }
  };

  const clearTrackedBlockers = (context: MiddlewareContext): void => {
    switch (context.action) {
      case "clear":
        for (const tracked of activeBlockers.values()) {
          const { registration: trackedRegistration } = tracked;

          if (isDefined(trackedRegistration)) {
            registrations.delete(trackedRegistration);
          }
        }
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
    const { action, blockerId, config, timestamp, prevState, scope, count, registration } = context;

    // Track when blockers are added
    if (action === "add") {
      const tracked = { timestamp, scope: config?.scope, registration };

      activeBlockers.set(blockerId, tracked);
      if (isDefined(registration)) {
        registrations.set(registration, tracked);
      }
    }

    if (action === "update") {
      const trackedBlocker = activeBlockers.get(blockerId);

      if (isDefined(trackedBlocker) && isDefined(config?.scope)) {
        trackedBlocker.scope = config.scope;
      }
    }

    // Calculate duration for terminal events
    const duration = getDuration(action, blockerId, timestamp, registration);

    clearTrackedBlockers(context);

    // Record the event
    addEvent({
      action,
      blockerId,
      config,
      timestamp,
      prevState,
      duration,
      scope,
      count,
    });
  };
}

export function createDevtoolsMiddleware(): Middleware {
  return createDevtoolsMiddlewareForStore(devtoolsStoreApi);
}
