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

/**
 * Creates middleware for monitoring blocker performance and detecting slow blocks.
 * 
 * Tracks the duration of each blocker (from add to remove) and warns when a blocker
 * exceeds the configured threshold. Useful for identifying performance issues,
 * stuck blockers, or operations that take too long.
 * 
 * Automatically logs warnings to console for slow blocks and optionally invokes
 * a callback for custom handling (e.g., error reporting, analytics).
 * 
 * @param config - Performance monitoring configuration
 * @param config.slowBlockThreshold - Duration in ms before considering a block "slow".
 *                                     Defaults to 3000ms (3 seconds).
 * @param config.onSlowBlock - Optional callback invoked when a slow block is detected.
 *                             Receives blockerId and duration in milliseconds.
 * 
 * @returns Middleware function for performance monitoring
 * 
 * @example
 * Basic usage with default threshold
 * ```ts
 * import { configureMiddleware, createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';
 * 
 * const performanceMiddleware = createPerformanceMiddleware();
 * 
 * configureMiddleware([performanceMiddleware]);
 * // Warns if any blocker lasts > 3 seconds
 * ```
 * 
 * @example
 * Custom threshold and callback
 * ```ts
 * const performanceMiddleware = createPerformanceMiddleware({
 *   slowBlockThreshold: 5000, // 5 seconds
 *   onSlowBlock: (blockerId, duration) => {
 *     console.error(`Blocker ${blockerId} took ${duration}ms`);
 *     
 *     // Report to error tracking
 *     Sentry.captureMessage('Slow UI Blocker', {
 *       extra: { blockerId, duration }
 *     });
 *   }
 * });
 * ```
 * 
 * @example
 * With analytics integration
 * ```ts
 * const performanceMiddleware = createPerformanceMiddleware({
 *   slowBlockThreshold: 2000,
 *   onSlowBlock: (blockerId, duration) => {
 *     // Track slow blocks in analytics
 *     analytics.track('slow_blocker_detected', {
 *       blocker_id: blockerId,
 *       duration_ms: duration,
 *       threshold_ms: 2000
 *     });
 *   }
 * });
 * ```
 * 
 * @example
 * Development vs Production
 * ```ts
 * const performanceMiddleware = createPerformanceMiddleware({
 *   // Strict threshold in development
 *   slowBlockThreshold: process.env.NODE_ENV === 'production' ? 5000 : 1000,
 *   onSlowBlock: (blockerId, duration) => {
 *     if (process.env.NODE_ENV === 'production') {
 *       // Report to error service in production
 *       errorService.log({ blockerId, duration });
 *     } else {
 *       // Detailed logging in development
 *       console.table({ blockerId, duration });
 *     }
 *   }
 * });
 * ```
 * 
 * @see {@link PerformanceConfig} for configuration options
 * @see {@link configureMiddleware} for registering middleware
 * 
 * @public
 * @since 0.6.0
 */
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
