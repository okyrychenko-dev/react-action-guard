import { ReactElement, useEffect, useRef } from "react";
import { DEFAULT_MAX_EVENTS, useDevtoolsStore } from "../../store";
import { getDevtoolsKeyboardAction } from "./ActionGuardDevtools.utils";
import ActionGuardDevtoolsContent from "./ActionGuardDevtoolsContent";
import type { Optional } from "@okyrychenko-dev/type-utils";
import type {
  ObservationParticipation,
  ObservationSession,
} from "./acquireDevtoolsMiddleware.types";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";

interface ActionGuardDevtoolsSessionProps extends Omit<
  ActionGuardDevtoolsProps,
  "showInProduction"
> {
  observationSession: ObservationSession;
}

function ActionGuardDevtoolsSession(props: ActionGuardDevtoolsSessionProps): ReactElement {
  const {
    position = "right",
    defaultOpen = false,
    maxEvents = DEFAULT_MAX_EVENTS,
    observationSession,
    stuckThresholdMs,
    store: customStore,
  } = props;

  const participationRef = useRef<Optional<ObservationParticipation>>(undefined);

  const { isOpen, setOpen, togglePause, clearEvents } = useDevtoolsStore((state) => ({
    isOpen: state.isOpen,
    setOpen: state.setOpen,
    togglePause: state.togglePause,
    clearEvents: state.clearEvents,
  }));

  useEffect(() => {
    const participation = observationSession.participate();

    participationRef.current = participation;

    return () => {
      participationRef.current = undefined;
      participation.release();
    };
  }, [observationSession]);

  useEffect(() => {
    participationRef.current?.updateConfiguration({ defaultOpen, maxEvents });
  }, [defaultOpen, maxEvents, observationSession]);

  const stateRef = useRef({ isOpen, setOpen, togglePause, clearEvents });

  useEffect(() => {
    stateRef.current = { isOpen, setOpen, togglePause, clearEvents };
  }, [isOpen, setOpen, togglePause, clearEvents]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { isOpen, setOpen, togglePause, clearEvents } = stateRef.current;
      const action = getDevtoolsKeyboardAction(event, isOpen);

      if (!action) {
        return;
      }

      if (action.preventDefault) {
        event.preventDefault();
      }

      switch (action.action) {
        case "close":
          setOpen(false);
          break;
        case "togglePause":
          togglePause();
          break;
        case "clearEvents":
          clearEvents();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ActionGuardDevtoolsContent
      position={position}
      store={customStore}
      stuckThresholdMs={stuckThresholdMs}
    />
  );
}

export default ActionGuardDevtoolsSession;
