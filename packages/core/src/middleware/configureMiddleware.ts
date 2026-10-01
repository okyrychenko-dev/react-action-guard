import { uiBlockingStoreApi } from "../store";
import type { Middleware } from "./middleware.types";

let configuredReleases: ReadonlyArray<VoidFunction> = [];

/** Replace configured global observations without releasing independently owned observations. */
export function configureMiddleware(middlewares: ReadonlyArray<Middleware>): void {
  const { observeBlockingEvents } = uiBlockingStoreApi.getState();

  for (const release of configuredReleases) {
    release();
  }
  configuredReleases = middlewares.map(observeBlockingEvents);
}
