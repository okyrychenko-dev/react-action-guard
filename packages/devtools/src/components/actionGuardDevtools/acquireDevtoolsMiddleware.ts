import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { type Optional, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddlewareForStore } from "../../middleware";
import { createDevtoolsStoreBindings, devtoolsStoreApi } from "../../store";
import type { Middleware } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsStoreApi } from "../../store";
import type { UIBlockingStoreApi } from "./ActionGuardDevtools.types";

/**
 * Shares one Devtools observation lease per blocking store while participants are active.
 *
 * Several `<ActionGuardDevtools />` instances may observe the same store. The first participant
 * attaches the observer; the last participant releases it and resets the session.
 */
export interface ObservationSession {
  configuration: Optional<ObservationSessionConfiguration>;
  devtoolsStore: DevtoolsStoreApi;
  releaseObservation: Optional<VoidFunction>;
  observerCount: number;
  targetStore: UIBlockingStoreApi;
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

function observeSession(session: ObservationSession): void {
  const { devtoolsStore, targetStore } = session;
  const { observeBlockingEvents } = targetStore.getState();
  const middleware = createDevtoolsMiddlewareForStore(devtoolsStore);
  const observer: Middleware = (event) => {
    if (targetStore === uiBlockingStoreApi) {
      const { middlewares } = targetStore.getState();

      if (middlewares.has(DEVTOOLS_MIDDLEWARE_NAME)) {
        return;
      }
    }

    return middleware(event);
  };

  session.releaseObservation = observeBlockingEvents(observer);
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
    releaseObservation: undefined,
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
        observeSession(session);
      }
    } else {
      observeSession(session);
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
              "Devtools middleware and added an observation lease for the custom store."
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

      session.releaseObservation?.();
      session.releaseObservation = undefined;

      resetObservationSession(session.devtoolsStore);
    }
  };
}
