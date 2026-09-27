import { isUndefined } from "@okyrychenko-dev/type-utils";
import { Middleware, MiddlewareContext } from "./middleware.types";
import { PerformanceConfig } from "./performanceMiddleware.types";
import { handleAddAction } from "./performanceMiddleware.utils";

const DEFAULT_SLOW_BLOCK_THRESHOLD = 3000;
const ACTION_ADD = "add";
const ACTION_REMOVE = "remove";

/**
 * Helper function to handle blocker removal and duration tracking.
 * @internal
 */
function handleRemoveAction(
  context: MiddlewareContext,
  blockStartTimes: Map<string, number>,
  slowBlockThreshold: number,
  onSlowBlock?: (blockerId: string, duration: number) => void
): void {
  const startTime = blockStartTimes.get(context.blockerId);

  if (isUndefined(startTime)) {
    return;
  }

  const duration = context.timestamp - startTime;

  blockStartTimes.delete(context.blockerId);

  if (duration >= slowBlockThreshold) {
    onSlowBlock?.(context.blockerId, duration);
  }
}

/**
 * Creates middleware for monitoring blocker performance and detecting slow blocks.
 *
 * @public
 * @since 0.6.0
 * @see {@link PerformanceConfig} for configuration options
 * @see {@link configureMiddleware} for registering middleware
 */
export function createPerformanceMiddleware(config: PerformanceConfig = {}): Middleware {
  const { slowBlockThreshold = DEFAULT_SLOW_BLOCK_THRESHOLD, onSlowBlock } = config;
  const blockStartTimes = new Map<string, number>();

  return (context) => {
    if (context.action === ACTION_ADD) {
      handleAddAction(context.blockerId, context.timestamp, blockStartTimes);
    } else if (context.action === ACTION_REMOVE) {
      handleRemoveAction(context, blockStartTimes, slowBlockThreshold, onSlowBlock);
    }
  };
}
