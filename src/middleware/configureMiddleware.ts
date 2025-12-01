import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import type { Middleware } from "./middleware.types";

/**
 * Configure middleware for the UI blocking store
 *
 * This is a convenience function that registers multiple middleware at once.
 * Each middleware will be registered with an auto-generated name based on its index.
 *
 * @param middlewares - Array of middleware functions to register
 *
 */
export function configureMiddleware(middlewares: ReadonlyArray<Middleware>): void {
  const store = uiBlockingStoreApi.getState();

  middlewares.forEach((middleware, index) => {
    // Generate a unique name for each middleware
    const name = `middleware-${index.toString()}`;
    store.registerMiddleware(name, middleware);
  });
}
