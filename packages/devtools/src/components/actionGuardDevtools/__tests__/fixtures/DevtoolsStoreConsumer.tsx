import { ReactElement } from "react";
import { useDevtoolsStore } from "../../../../store";

function DevtoolsStoreConsumer(): ReactElement {
  const { events, isOpen, isPaused, maxEvents, togglePause } = useDevtoolsStore((state) => ({
    events: state.events,
    isOpen: state.isOpen,
    isPaused: state.isPaused,
    maxEvents: state.maxEvents,
    togglePause: state.togglePause,
  }));

  return (
    <div>
      <span>Observed events: {events.map((event) => event.blockerId).join(", ")}</span>
      <span>Configured maximum: {maxEvents}</span>
      <span>Configured open state: {isOpen ? "open" : "closed"}</span>
      <button onClick={togglePause}>{isPaused ? "Resume consumer" : "Pause consumer"}</button>
    </div>
  );
}

export default DevtoolsStoreConsumer;
