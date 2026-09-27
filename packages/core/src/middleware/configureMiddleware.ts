import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import type { Middleware } from "./middleware.types";

const CONFIGURE_MIDDLEWARE_PREFIX = "middleware-";

/**
 * Configures and registers multiple middleware functions for the UI blocking store.
 *
 * @public
 * @since 0.6.0
 * @see {@link Middleware} for middleware function signature
 * @see {@link loggerMiddleware} for built-in logging middleware
 * @see {@link createAnalyticsMiddleware} for analytics tracking
 * @see {@link createPerformanceMiddleware} for performance monitoring
 */
export function configureMiddleware(middlewares: ReadonlyArray<Middleware>): void {
  const store = uiBlockingStoreApi.getState();

  // Remove middleware registered by previous configureMiddleware calls.
  // Keep provider-level middlewares intact.
  store.middlewares.forEach((_, name) => {
    if (name.startsWith(CONFIGURE_MIDDLEWARE_PREFIX)) {
      store.unregisterMiddleware(name);
    }
  });

  middlewares.forEach((middleware, index) => {
    // Generate a unique name for each middleware
    const name = `${CONFIGURE_MIDDLEWARE_PREFIX}${index.toString()}`;

    store.registerMiddleware(name, middleware);
  });
}
