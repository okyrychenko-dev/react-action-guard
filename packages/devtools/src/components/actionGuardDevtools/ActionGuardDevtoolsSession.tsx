import { ReactElement, useEffect, useRef } from "react";
import { DEFAULT_MAX_EVENTS, useDevtoolsStore } from "../../store";
import { acquireDevtoolsMiddleware } from "./acquireDevtoolsMiddleware";
import { getDevtoolsKeyboardAction } from "./ActionGuardDevtools.utils";
import ActionGuardDevtoolsContent from "./ActionGuardDevtoolsContent";
import type { ObservationSession } from "./acquireDevtoolsMiddleware";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";

interface ActionGuardDevtoolsSessionProps extends Omit<
  ActionGuardDevtoolsProps,
  "showInProduction"
> {
  observationSession: ObservationSession;
  targetStore: NonNullable<ActionGuardDevtoolsProps["store"]>;
}

function ActionGuardDevtoolsSession(props: ActionGuardDevtoolsSessionProps): ReactElement {
  const {
    position = "right",
    defaultOpen = false,
    maxEvents = DEFAULT_MAX_EVENTS,
    observationSession,
    stuckThresholdMs,
    store: customStore,
    targetStore,
  } = props;

  const initialDefaultOpenRef = useRef(defaultOpen);

  const { setOpen, setMaxEvents, isOpen, togglePause, clearEvents } = useDevtoolsStore((state) => ({
    setOpen: state.setOpen,
    setMaxEvents: state.setMaxEvents,
    isOpen: state.isOpen,
    togglePause: state.togglePause,
    clearEvents: state.clearEvents,
  }));

  useEffect(
    () => acquireDevtoolsMiddleware(targetStore, observationSession),
    [observationSession, targetStore]
  );

  useEffect(() => {
    setOpen(initialDefaultOpenRef.current);
  }, [setOpen]);

  useEffect(() => {
    setMaxEvents(maxEvents);
  }, [maxEvents, setMaxEvents]);

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
