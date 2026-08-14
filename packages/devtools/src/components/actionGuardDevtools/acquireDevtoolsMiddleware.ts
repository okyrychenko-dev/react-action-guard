import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "../../middleware";
import type { UIBlockingStoreApi } from "./ActionGuardDevtools.types";

/**
 * Ref-counts devtools-middleware registration per blocking store.
 *
 * Several `<ActionGuardDevtools />` instances may observe the same store, and all of them feed
 * the single global devtools event store. Registering one middleware per instance would record
 * every event multiple times, while unregistering on each unmount would tear the middleware
 * down for still-mounted instances. So we register exactly one middleware on the first acquire
 * and only unregister once the last consumer releases it.
 *
 * @param store - The blocking store to attach the middleware to
 * @returns A release function to call on unmount (idempotent)
 */
const middlewareRefCounts = new WeakMap<UIBlockingStoreApi, number>();

export function acquireDevtoolsMiddleware(store: UIBlockingStoreApi): VoidFunction {
  const count = middlewareRefCounts.get(store) ?? 0;

  if (count === 0) {
    store.getState().registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware());
  }

  middlewareRefCounts.set(store, count + 1);

  let released = false;

  return () => {
    if (released) {
      return;
    }
    released = true;

    const next = (middlewareRefCounts.get(store) ?? 1) - 1;

    if (next <= 0) {
      middlewareRefCounts.delete(store);
      store.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
    } else {
      middlewareRefCounts.set(store, next);
    }
  };
}
