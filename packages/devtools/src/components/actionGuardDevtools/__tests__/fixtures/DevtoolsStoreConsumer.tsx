import { useDevtoolsStore } from "@devtools/store";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { ReactElement } from "react";

function DevtoolsStoreConsumer(): ReactElement {
  const {
    activeTab,
    events,
    filter,
    isMinimized,
    isOpen,
    isPaused,
    maxEvents,
    selectedEventId,
    setActiveTab,
    setFilter,
    selectEvent,
    toggleMinimized,
    togglePause,
  } = useDevtoolsStore((state) => ({
    activeTab: state.activeTab,
    events: state.events,
    filter: state.filter,
    isMinimized: state.isMinimized,
    isOpen: state.isOpen,
    isPaused: state.isPaused,
    maxEvents: state.maxEvents,
    selectedEventId: state.selectedEventId,
    setActiveTab: state.setActiveTab,
    setFilter: state.setFilter,
    selectEvent: state.selectEvent,
    toggleMinimized: state.toggleMinimized,
    togglePause: state.togglePause,
  }));

  const selectStats = (): void => {
    setActiveTab("stats");
  };

  const setPersistedSearch = (): void => {
    setFilter({ search: "provider-blocker" });
  };

  const selectFirstEvent = (): void => {
    const firstEvent = events[0];

    if (isDefined(firstEvent)) {
      selectEvent(firstEvent.id);
    }
  };

  return (
    <div>
      <span>Observed events: {events.map((event) => event.blockerId).join(", ")}</span>
      <span>Configured maximum: {maxEvents}</span>
      <span>Configured open state: {isOpen ? "open" : "closed"}</span>
      <span>Active preference: {activeTab}</span>
      <span>Search preference: {filter.search}</span>
      <span>Minimized preference: {isMinimized ? "minimized" : "expanded"}</span>
      <span>Selected event: {isDefined(selectedEventId) ? "selected" : "none"}</span>
      <button onClick={selectStats}>Set stats preference</button>
      <button onClick={setPersistedSearch}>Set search preference</button>
      <button onClick={toggleMinimized}>Toggle minimized preference</button>
      <button onClick={selectFirstEvent}>Select first event</button>
      <button onClick={togglePause}>{isPaused ? "Resume consumer" : "Pause consumer"}</button>
    </div>
  );
}

export default DevtoolsStoreConsumer;
