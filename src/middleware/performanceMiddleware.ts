import { Middleware, MiddlewareContext } from "./middleware.types";
import { PerformanceConfig } from "./performanceMiddleware.types";
import { handleAddAction } from "./performanceMiddleware.utils";

const DEFAULT_SLOW_BLOCK_THRESHOLD = 3000;
const ACTION_ADD = "add";
const ACTION_REMOVE = "remove";

const handleRemoveAction = (
  context: MiddlewareContext,
  blockStartTimes: Map<string, number>,
  slowBlockThreshold: number,
  onSlowBlock?: (blockerId: string, duration: number) => void
): void => {
  const startTime = blockStartTimes.get(context.blockerId);

  if (startTime === undefined) {
    return;
  }

  const duration = context.timestamp - startTime;
  blockStartTimes.delete(context.blockerId);

  if (duration >= slowBlockThreshold) {
    console.warn(
      `[UIBlocking] Slow block detected: "${context.blockerId}" took ${duration.toString()}ms`
    );

    onSlowBlock?.(context.blockerId, duration);
  }
};

export const createPerformanceMiddleware = (config: PerformanceConfig = {}): Middleware => {
  const { slowBlockThreshold = DEFAULT_SLOW_BLOCK_THRESHOLD, onSlowBlock } = config;
  const blockStartTimes = new Map<string, number>();

  return (context) => {
    if (context.action === ACTION_ADD) {
      handleAddAction(context.blockerId, context.timestamp, blockStartTimes);
    } else if (context.action === ACTION_REMOVE) {
      handleRemoveAction(context, blockStartTimes, slowBlockThreshold, onSlowBlock);
    }
  };
};
