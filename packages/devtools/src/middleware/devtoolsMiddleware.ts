import { devtoolsStoreApi } from "../store";
import type { Middleware, MiddlewareContext } from "@okyrychenko-dev/react-action-guard";

export const DEVTOOLS_MIDDLEWARE_NAME = "action-guard-devtools";

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
 * This middleware intercepts all blocking events (add, remove, timeout, clear) and
 * forwards them to the devtools store for visualization in the ActionGuardDevtools panel.
 *
 * The middleware calculates the duration of each blocker by tracking when it was added
 * and when it was removed/timed out, providing insights into how long UI was blocked.
 *
 * **Note:** This middleware is automatically registered when you use the `ActionGuardDevtools`
 * component. You typically don't need to call this function directly unless you're manually
 * managing middleware registration.
 *
 * @returns Middleware function that can be registered with `configureMiddleware` or `registerMiddleware`
 *
 * @example
 * Manual middleware registration (advanced usage)
 * ```tsx
 * import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';
 * import { createDevtoolsMiddleware, DEVTOOLS_MIDDLEWARE_NAME } from '@okyrychenko-dev/react-action-guard-devtools';
 *
 * // Register manually
 * const middleware = createDevtoolsMiddleware();
 * uiBlockingStoreApi.getState().registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);
 *
 * // Cleanup
 * uiBlockingStoreApi.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
 * ```
 *
 * @example
 * Automatic registration (recommended)
 * ```tsx
 * import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';
 *
 * // Middleware registered automatically when component mounts
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ActionGuardDevtools />
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link ActionGuardDevtools} for automatic middleware registration
 * @see {@link https://github.com/okyrychenko-dev/react-action-guard#middleware | Middleware documentation}
 *
 * @public
 */
export function createDevtoolsMiddleware(): Middleware {
  // Track add timestamps for duration calculation
  const activeBlockers = new Map<string, TrackedBlocker>();

  const getDuration = (
    action: MiddlewareContext["action"],
    blockerId: string,
    timestamp: number
  ): number | undefined => {
    if (!TERMINAL_ACTIONS.has(action)) {
      return undefined;
    }

    const trackedBlocker = activeBlockers.get(blockerId);
    if (trackedBlocker === undefined) {
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

      if (Array.isArray(trackedBlocker.scope) && trackedBlocker.scope.includes(scope)) {
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
        if (context.scope !== undefined) {
          clearScopedBlockers(context.scope);
        }
        break;
      default:
        break;
    }
  };

  return (context: MiddlewareContext): void => {
    const { addEvent } = devtoolsStoreApi.getState();

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
