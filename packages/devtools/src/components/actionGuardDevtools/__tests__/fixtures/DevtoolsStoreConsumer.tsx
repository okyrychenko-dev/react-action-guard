import { ReactElement } from "react";
import { useDevtoolsStore } from "../../../../store";

function DevtoolsStoreConsumer(): ReactElement {
  const { events, isPaused, togglePause } = useDevtoolsStore((state) => ({
    events: state.events,
    isPaused: state.isPaused,
    togglePause: state.togglePause,
  }));

  return (
    <div>
      <span>Observed events: {events.map((event) => event.blockerId).join(", ")}</span>
      <button onClick={togglePause}>{isPaused ? "Resume consumer" : "Pause consumer"}</button>
    </div>
  );
}

export default DevtoolsStoreConsumer;
