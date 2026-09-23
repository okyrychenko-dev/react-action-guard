import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { type Optional, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
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
  configuration: Optional<ObservationSessionConfiguration>;
  devtoolsStore: DevtoolsStoreApi;
  middlewareRegistration: Optional<ObservationSessionMiddlewareRegistration>;
  observerCount: number;
  targetStore: UIBlockingStoreApi;
}

interface ObservationSessionMiddlewareRegistration {
  middleware: Middleware;
  name: string;
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

const observationSessions = new WeakMap<UIBlockingStoreApi, ObservationSession>();
const OBSERVATION_SESSION_MIDDLEWARE_NAME = `${DEVTOOLS_MIDDLEWARE_NAME}-observation-session`;

function getAvailableMiddlewareName(middlewares: ReadonlyMap<string, Middleware>): string {
  let middlewareName = OBSERVATION_SESSION_MIDDLEWARE_NAME;
  let suffix = 1;

  while (middlewares.has(middlewareName)) {
    middlewareName = `${OBSERVATION_SESSION_MIDDLEWARE_NAME}-${suffix.toString()}`;
    suffix += 1;
  }

  return middlewareName;
}

function registerSessionMiddleware(session: ObservationSession, name: string): void {
  const { devtoolsStore, targetStore } = session;
  const { registerMiddleware } = targetStore.getState();
  const middleware: Middleware = createDevtoolsMiddlewareForStore(devtoolsStore);

  registerMiddleware(name, middleware);
  session.middlewareRegistration = { middleware, name };
}

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
    middlewareRegistration: undefined,
    observerCount: 0,
    targetStore: store,
  };

  observationSessions.set(store, session);
  return session;
}

export function resolveDevtoolsObservationSession(
  customStore?: UIBlockingStoreApi
): ObservationSession {
  const targetStore = customStore ?? uiBlockingStoreApi;

  return getDevtoolsObservationSession(
    targetStore,
    targetStore === uiBlockingStoreApi ? devtoolsStoreApi : undefined
  );
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

export function acquireDevtoolsMiddleware(session: ObservationSession): VoidFunction {
  const { observerCount, targetStore } = session;

  if (observerCount === 0) {
    observationSessions.set(targetStore, session);

    const { middlewares } = targetStore.getState();
    const existingMiddleware = middlewares.get(DEVTOOLS_MIDDLEWARE_NAME);
    const isGlobalSession = targetStore === uiBlockingStoreApi;

    if (isGlobalSession) {
      if (isUndefined(existingMiddleware)) {
        registerSessionMiddleware(session, DEVTOOLS_MIDDLEWARE_NAME);
      }
    } else {
      const middlewareName = getAvailableMiddlewareName(middlewares);

      registerSessionMiddleware(session, middlewareName);
    }

    if (isDefined(existingMiddleware)) {
      if (process.env.NODE_ENV !== "production") {
        if (isGlobalSession) {
          console.warn(
            "[ActionGuardDevtools] Automatic observation found an existing manual Devtools " +
              "middleware registration. The manual registration remains authoritative."
          );
        } else {
          console.warn(
            "[ActionGuardDevtools] Automatic observation preserved the existing manual " +
              "Devtools middleware and added a session-specific registration for the custom store."
          );
        }
      }
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
      if (targetStore !== uiBlockingStoreApi) {
        observationSessions.delete(targetStore);
      }
      session.configuration = undefined;

      if (isDefined(session.middlewareRegistration)) {
        const { middleware, name } = session.middlewareRegistration;
        const { middlewares, unregisterMiddleware } = targetStore.getState();
        const currentMiddleware = middlewares.get(name);

        if (currentMiddleware === middleware) {
          unregisterMiddleware(name);
        }
        session.middlewareRegistration = undefined;
      }

      resetObservationSession(session.devtoolsStore);
    }
  };
}
