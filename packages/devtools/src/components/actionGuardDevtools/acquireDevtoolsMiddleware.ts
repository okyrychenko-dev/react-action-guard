import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { type Optional, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddlewareForStore } from "../../middleware";
import { createDevtoolsStoreBindings, devtoolsStoreApi } from "../../store";
import type { DevtoolsStoreApi } from "../../store";
import type {
  ObservationSession,
  ObservationSessionConfiguration,
} from "./acquireDevtoolsMiddleware.types";
import type { UIBlockingStoreApi } from "./ActionGuardDevtools.types";

interface Participant {
  configuration?: ObservationSessionConfiguration;
}

const observationSessions = new WeakMap<UIBlockingStoreApi, ObservationSession>();

function resetObservationSession(devtoolsStore: DevtoolsStoreApi): void {
  const { events, isOpen, isPaused, maxEvents, selectedEventId } = devtoolsStore.getInitialState();

  devtoolsStore.setState({ events, isOpen, isPaused, maxEvents, selectedEventId });
}

function createObservationSession(
  targetStore: UIBlockingStoreApi,
  devtoolsStore: DevtoolsStoreApi
): ObservationSession {
  const participants = new Map<object, Participant>();
  let configurationOwner: Optional<object>;
  let appliedConfiguration: Optional<ObservationSessionConfiguration>;
  let releaseObservation: Optional<VoidFunction>;
  let epoch = 0;

  function attachObservation(): void {
    const { middlewares, observeBlockingEvents } = targetStore.getState();
    const existingMiddleware = middlewares.get(DEVTOOLS_MIDDLEWARE_NAME);
    const isGlobalSession = targetStore === uiBlockingStoreApi;

    if (!isGlobalSession || isUndefined(existingMiddleware)) {
      const middleware = createDevtoolsMiddlewareForStore(devtoolsStore);

      let options = undefined;

      if (isGlobalSession) {
        options = {
          skipWhenNamedMiddlewareActive: DEVTOOLS_MIDDLEWARE_NAME,
        };
      }

      releaseObservation = observeBlockingEvents(middleware, options);
    }

    if (isDefined(existingMiddleware) && process.env.NODE_ENV !== "production") {
      let message =
        "[ActionGuardDevtools] Automatic observation preserved the existing manual " +
        "Devtools middleware and added an observation lease for the custom store.";

      if (isGlobalSession) {
        message =
          "[ActionGuardDevtools] Automatic observation found an existing manual Devtools " +
          "middleware registration. The manual registration remains authoritative.";
      }

      console.warn(message);
    }
  }

  function applyConfiguration(
    configuration: ObservationSessionConfiguration,
    initialConfiguration: boolean
  ): void {
    const { setMaxEvents, setOpen } = devtoolsStore.getState();

    if (initialConfiguration) {
      setOpen(configuration.defaultOpen);
    }

    if (initialConfiguration || appliedConfiguration?.maxEvents !== configuration.maxEvents) {
      setMaxEvents(configuration.maxEvents);
    }

    const { maxEvents } = devtoolsStore.getState();

    appliedConfiguration = { defaultOpen: configuration.defaultOpen, maxEvents };
  }

  function warnOnConflict(configuration: ObservationSessionConfiguration): void {
    if (
      process.env.NODE_ENV !== "production" &&
      (appliedConfiguration?.defaultOpen !== configuration.defaultOpen ||
        appliedConfiguration.maxEvents !== configuration.maxEvents)
    ) {
      console.warn(
        "[ActionGuardDevtools] Ignored conflicting observation-session configuration. " +
          "The first panel for a blocking store controls defaultOpen and maxEvents."
      );
    }
  }

  function configureParticipant(
    participant: object,
    configuration: ObservationSessionConfiguration
  ): void {
    const record = participants.get(participant);

    if (isUndefined(record)) {
      return;
    }

    record.configuration = configuration;

    if (isUndefined(configurationOwner)) {
      configurationOwner = participant;
      applyConfiguration(configuration, isUndefined(appliedConfiguration));
    } else if (configurationOwner === participant) {
      applyConfiguration(configuration, false);
    } else {
      warnOnConflict(configuration);
    }
  }

  return {
    devtoolsStore,
    participate(configuration) {
      if (participants.size === 0) {
        attachObservation();
      }

      const participant = {};
      const joinedEpoch = epoch;

      participants.set(participant, {});

      if (isDefined(configuration)) {
        configureParticipant(participant, configuration);
      }

      return {
        updateConfiguration(nextConfiguration) {
          if (joinedEpoch !== epoch) {
            return;
          }

          configureParticipant(participant, nextConfiguration);
        },
        release() {
          if (joinedEpoch !== epoch || !participants.delete(participant)) {
            return;
          }

          if (configurationOwner === participant) {
            configurationOwner = undefined;

            for (const [candidate, record] of participants) {
              if (isDefined(record.configuration)) {
                configurationOwner = candidate;
                break;
              }
            }
          }

          if (participants.size === 0) {
            releaseObservation?.();
            releaseObservation = undefined;
            configurationOwner = undefined;
            appliedConfiguration = undefined;
            epoch += 1;
            resetObservationSession(devtoolsStore);
          }
        },
      };
    },
  };
}

export function getDevtoolsObservationSession(
  store: UIBlockingStoreApi,
  initialDevtoolsStore?: DevtoolsStoreApi
): ObservationSession {
  const existingSession = observationSessions.get(store);

  if (isDefined(existingSession)) {
    return existingSession;
  }

  const session = createObservationSession(
    store,
    initialDevtoolsStore ?? createDevtoolsStoreBindings().store
  );

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
