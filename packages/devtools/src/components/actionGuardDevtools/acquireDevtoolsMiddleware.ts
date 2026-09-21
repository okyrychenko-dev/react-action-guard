import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddlewareForStore } from "../../middleware";
import { createDevtoolsStoreBindings, devtoolsStoreApi } from "../../store";
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
  configuration: ObservationSessionConfiguration | undefined;
  devtoolsStore: DevtoolsStoreApi;
  observerCount: number;
  ownsMiddlewareRegistration: boolean;
}

interface ObservationSessionConfiguration {
  defaultOpen: boolean;
  maxEvents: number;
  owner: object;
}

interface ConfigureObservationSessionOptions {
  defaultOpen: boolean;
  maxEvents: number;
  owner: object;
}

export interface ResolvedObservationSession {
  observationSession: ObservationSession;
  targetStore: UIBlockingStoreApi;
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
    configuration: undefined,
    devtoolsStore: initialDevtoolsStore ?? createDevtoolsStoreBindings().store,
    observerCount: 0,
    ownsMiddlewareRegistration: false,
  };

  observationSessions.set(store, session);
  return session;
}

export function resolveDevtoolsObservationSession(
  customStore?: UIBlockingStoreApi
): ResolvedObservationSession {
  const targetStore = customStore ?? uiBlockingStoreApi;
  const observationSession = getDevtoolsObservationSession(
    targetStore,
    targetStore === uiBlockingStoreApi ? devtoolsStoreApi : undefined
  );

  return { observationSession, targetStore };
}

export function configureDevtoolsObservationSession(
  session: ObservationSession,
  options: ConfigureObservationSessionOptions
): void {
  const { configuration, devtoolsStore } = session;
  const { defaultOpen, maxEvents, owner } = options;

  if (isUndefined(configuration)) {
    const { setMaxEvents, setOpen } = devtoolsStore.getState();

    setOpen(defaultOpen);
    setMaxEvents(maxEvents);

    const { maxEvents: configuredMaxEvents } = devtoolsStore.getState();

    session.configuration = {
      defaultOpen,
      maxEvents: configuredMaxEvents,
      owner,
    };
    return;
  }

  if (configuration.owner === owner) {
    if (configuration.maxEvents !== maxEvents) {
      const { setMaxEvents } = devtoolsStore.getState();

      setMaxEvents(maxEvents);

      const { maxEvents: configuredMaxEvents } = devtoolsStore.getState();

      configuration.maxEvents = configuredMaxEvents;
    }
    return;
  }

  const hasConflict =
    configuration.defaultOpen !== defaultOpen || configuration.maxEvents !== maxEvents;

  if (process.env.NODE_ENV !== "production" && hasConflict) {
    console.warn(
      "[ActionGuardDevtools] Ignored conflicting observation-session configuration. " +
        "The first panel for a blocking store controls defaultOpen and maxEvents."
    );
  }
}

export function acquireDevtoolsMiddleware(
  store: UIBlockingStoreApi,
  session: ObservationSession
): VoidFunction {
  const { observerCount } = session;

  if (observerCount === 0) {
    observationSessions.set(store, session);

    const { middlewares, registerMiddleware } = store.getState();
    const existingMiddleware = middlewares.get(DEVTOOLS_MIDDLEWARE_NAME);

    if (isDefined(existingMiddleware)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[ActionGuardDevtools] Automatic observation found an existing manual Devtools " +
            "middleware registration. The manual registration remains authoritative."
        );
      }
    } else {
      const middleware: Middleware = createDevtoolsMiddlewareForStore(session.devtoolsStore);

      registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);
      session.ownsMiddlewareRegistration = true;
    }
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
      if (store !== uiBlockingStoreApi) {
        observationSessions.delete(store);
      }
      session.configuration = undefined;

      if (session.ownsMiddlewareRegistration) {
        const { unregisterMiddleware } = store.getState();

        unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
        session.ownsMiddlewareRegistration = false;
      }

      resetObservationSession(session.devtoolsStore);
    }
  };
}
