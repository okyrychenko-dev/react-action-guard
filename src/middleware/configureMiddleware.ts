import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import type { Middleware } from "./middleware.types";

/**
 * Configures and registers multiple middleware functions for the UI blocking store.
 * 
 * Convenience function that registers an array of middleware at once. Each middleware
 * is automatically assigned a unique name based on its array index ("middleware-0",
 * "middleware-1", etc.). Middleware are executed in the order they are registered.
 * 
 * All middleware receive {@link MiddlewareContext} containing action type, blocker ID,
 * configuration, and timestamp for each blocking event.
 * 
 * @param middlewares - Array of middleware functions to register. Functions are called
 *                      in order for each blocking action (add, remove, update, etc.)
 * 
 * @example
 * Basic usage with built-in middleware
 * ```ts
 * import { configureMiddleware, loggerMiddleware, createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';
 * 
 * configureMiddleware([
 *   loggerMiddleware,
 *   createPerformanceMiddleware({ threshold: 1000 })
 * ]);
 * ```
 * 
 * @example
 * With custom middleware
 * ```ts
 * const customMiddleware: Middleware = (context) => {
 *   if (context.action === 'add') {
 *     console.log(`Blocker added: ${context.blockerId}`);
 *   }
 * };
 * 
 * configureMiddleware([
 *   loggerMiddleware,
 *   customMiddleware
 * ]);
 * ```
 * 
 * @example
 * Analytics integration
 * ```ts
 * import { configureMiddleware, createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';
 * 
 * configureMiddleware([
 *   createAnalyticsMiddleware({
 *     provider: 'google-analytics',
 *     trackingId: 'GA-XXXXX'
 *   })
 * ]);
 * ```
 * 
 * @see {@link Middleware} for middleware function signature
 * @see {@link loggerMiddleware} for built-in logging middleware
 * @see {@link createAnalyticsMiddleware} for analytics tracking
 * @see {@link createPerformanceMiddleware} for performance monitoring
 * 
 * @public
 * @since 0.6.0
 */
export function configureMiddleware(middlewares: ReadonlyArray<Middleware>): void {
  const store = uiBlockingStoreApi.getState();

  middlewares.forEach((middleware, index) => {
    // Generate a unique name for each middleware
    const name = `middleware-${index.toString()}`;
    store.registerMiddleware(name, middleware);
  });
}
