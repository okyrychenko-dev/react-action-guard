import { isDefined } from "@okyrychenko-dev/type-utils";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddlewareForStore } from "../../middleware";
import { createDevtoolsStoreBindings } from "../../store";
import type { Middleware } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsStoreApi } from "../../store";
import type { UIBlockingStoreApi } from "./ActionGuardDevtools.types";

/**
 * Ref-counts devtools-middleware registration per blocking store.
 *
 * Several `<ActionGuardDevtools />` instances may observe the same store and share its observation
 * session. Registering one middleware per instance would record every event multiple times, while
 * unregistering on each unmount would tear the middleware down for still-mounted instances. So we
 * register exactly one middleware on the first acquire and only unregister once the last consumer
 * releases it.
 *
 * @param store - The blocking store to attach the middleware to
 * @returns A release function to call on unmount (idempotent)
 */
export interface ObservationSession {
  devtoolsStore: DevtoolsStoreApi;
  observerCount: number;
}

const observationSessions = new WeakMap<UIBlockingStoreApi, ObservationSession>();

function resetObservationSession(devtoolsStore: DevtoolsStoreApi): void {
  const { events, isOpen, isPaused, maxEvents, selectedEventId } = devtoolsStore.getInitialState();

  devtoolsStore.setState({ events, isOpen, isPaused, maxEvents, selectedEventId });
}

export function getDevtoolsObservationSession(
  store: UIBlockingStoreApi,
  initialDevtoolsStore?: DevtoolsStoreApi
): ObservationSession {
  const existingSession = observationSessions.get(store);

  if (isDefined(existingSession)) {
    return existingSession;
  }

  const session: ObservationSession = {
    devtoolsStore: initialDevtoolsStore ?? createDevtoolsStoreBindings().store,
    observerCount: 0,
  };

  observationSessions.set(store, session);
  return session;
}

export function acquireDevtoolsMiddleware(
  store: UIBlockingStoreApi,
  session: ObservationSession
): VoidFunction {
  const { observerCount } = session;

  if (observerCount === 0) {
    observationSessions.set(store, session);

    const middleware: Middleware = createDevtoolsMiddlewareForStore(session.devtoolsStore);

    store.getState().registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);
  }

  session.observerCount += 1;

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;

    session.observerCount -= 1;

    if (session.observerCount === 0) {
      observationSessions.delete(store);

      store.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);

      resetObservationSession(session.devtoolsStore);
    }
  };
}
