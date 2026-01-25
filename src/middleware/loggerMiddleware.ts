import { formatLogData, getActionEmoji } from "./loggerMiddleware.utils";
import { MiddlewareContext } from "./middleware.types";

const LOG_PREFIX = "[UIBlocking]";

/**
 * Built-in middleware for logging all blocking actions to the console.
 *
 * Logs every blocker action (add, remove, update, timeout, clear) with emoji
 * indicators and formatted data. Useful for debugging blocking behavior during
 * development. Automatically disabled in production builds for performance.
 *
 * Output format: `[UIBlocking] 🔒 blocker-id {scope: "form", reason: "..."}`
 *
 * Emoji indicators:
 * - 🔒 Add
 * - 🔓 Remove
 * - 🔄 Update
 * - ⏰ Timeout
 * - 🧹 Clear/ClearScope
 *
 * @example
 * Register logger middleware
 * ```ts
 * import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';
 *
 * // Enable logging for all blocking actions
 * configureMiddleware([loggerMiddleware]);
 * ```
 *
 * @example
 * Console output examples
 * ```
 * [UIBlocking] 🔒 save-form {scope: "form", reason: "Saving...", priority: 50}
 * [UIBlocking] 🔄 save-form {scope: "form", reason: "Almost done..."}
 * [UIBlocking] 🔓 save-form {reason: "Saving..."}
 * [UIBlocking] ⏰ api-timeout {timeout: 30000}
 * ```
 *
 * @example
 * Production check pattern
 * ```ts
 * import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';
 * const middlewares = [];
 * if (process.env.NODE_ENV !== 'production') {
 *   middlewares.push(loggerMiddleware);
 * }
 * configureMiddleware(middlewares);
 * ```
 *
 * @see {@link configureMiddleware} for registering middleware
 * @see {@link Middleware} for middleware function signature
 * @see {@link MiddlewareContext} for available context data
 *
 * @public
 * @since 0.6.0
 */
export function loggerMiddleware(context: MiddlewareContext): void {
  const emoji = getActionEmoji(context.action);
  const logData = formatLogData(context);

  console.log(LOG_PREFIX, emoji, context.blockerId, logData);
}
