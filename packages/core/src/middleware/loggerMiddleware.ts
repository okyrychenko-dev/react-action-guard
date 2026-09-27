import { formatLogData, getActionEmoji } from "./loggerMiddleware.utils";
import { MiddlewareContext } from "./middleware.types";

const LOG_PREFIX = "[UIBlocking]";

/**
 * Built-in middleware for logging all blocking actions to the console.
 *
 * @public
 * @since 0.6.0
 * @see {@link configureMiddleware} for registering middleware
 * @see {@link Middleware} for middleware function signature
 * @see {@link MiddlewareContext} for available context data
 */
export function loggerMiddleware(context: MiddlewareContext): void {
  const emoji = getActionEmoji(context.action);
  const logData = formatLogData(context);

  console.log(LOG_PREFIX, emoji, context.blockerId, logData);
}
