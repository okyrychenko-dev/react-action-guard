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

  return (context) => {
    const { action, blockerId, timestamp, config: blockerConfig, scope } = context;

    if (action === "add") {
      trackedBlocks.set(blockerId, { timestamp, scope: blockerConfig?.scope ?? DEFAULT_SCOPE });
    } else if (action === "update") {
      const tracked = trackedBlocks.get(blockerId);

      if (isDefined(tracked) && isDefined(blockerConfig?.scope)) {
        tracked.scope = blockerConfig.scope;
      }
    } else {
      const endedBlocks = new Map<string, TrackedPerformanceBlock>();

      if (action === "remove" || action === "timeout") {
        const tracked = trackedBlocks.get(blockerId);

        if (isDefined(tracked)) {
          endedBlocks.set(blockerId, tracked);
          trackedBlocks.delete(blockerId);
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

      finalizeTrackedBlocks(endedBlocks, timestamp, slowBlockThreshold, onSlowBlock);
    }
  };
}
