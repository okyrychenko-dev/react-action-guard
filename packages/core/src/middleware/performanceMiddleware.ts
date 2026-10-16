import { isDefined } from "@okyrychenko-dev/type-utils";
import { DEFAULT_SCOPE, scopeMatchesTarget } from "../store/scope";
import { finalizeTrackedBlocks } from "./performanceMiddleware.utils";
import type { Middleware } from "./middleware.types";
import type { PerformanceConfig, TrackedPerformanceBlock } from "./performanceMiddleware.types";

const DEFAULT_SLOW_BLOCK_THRESHOLD = 3000;

/**
 * Measures registration lifetimes from add until removal, timeout or bulk clear.
 * Updates preserve the start; replacement adds restart it. Callback failures are isolated.
 * @public
 * @since 0.6.0
 */
export function createPerformanceMiddleware(config: PerformanceConfig = {}): Middleware {
  const { slowBlockThreshold = DEFAULT_SLOW_BLOCK_THRESHOLD, onSlowBlock } = config;
  const trackedBlocks = new Map<string, TrackedPerformanceBlock>();

  const registrations = new WeakMap<object, TrackedPerformanceBlock>();

  return (context) => {
    const { action, blockerId, timestamp, config: blockerConfig, scope, registration } = context;

    if (action === "add") {
      const tracked = { timestamp, scope: blockerConfig?.scope ?? DEFAULT_SCOPE, registration };

      trackedBlocks.set(blockerId, tracked);

      if (isDefined(registration)) {
        registrations.set(registration, tracked);
      }
    } else if (action === "update") {
      const tracked = trackedBlocks.get(blockerId);

      if (isDefined(tracked) && isDefined(blockerConfig?.scope)) {
        tracked.scope = blockerConfig.scope;
      }
    } else {
      const endedBlocks = new Map<string, TrackedPerformanceBlock>();

      if (action === "remove" || action === "timeout") {
        let tracked = trackedBlocks.get(blockerId);

        if (isDefined(registration)) {
          tracked = registrations.get(registration);
        }

        if (isDefined(tracked)) {
          endedBlocks.set(blockerId, tracked);
          if (trackedBlocks.get(blockerId) === tracked) {
            trackedBlocks.delete(blockerId);
          }
        }
      } else {
        for (const [id, tracked] of trackedBlocks) {
          const cleared =
            action === "clear" || (isDefined(scope) && scopeMatchesTarget(tracked.scope, scope));

          if (cleared) {
            endedBlocks.set(id, tracked);
            trackedBlocks.delete(id);
          }
        }
      }

      for (const tracked of endedBlocks.values()) {
        const { registration: trackedRegistration } = tracked;

        if (isDefined(trackedRegistration)) {
          registrations.delete(trackedRegistration);
        }
      }

      finalizeTrackedBlocks(endedBlocks, timestamp, slowBlockThreshold, onSlowBlock);
    }
  };
}
