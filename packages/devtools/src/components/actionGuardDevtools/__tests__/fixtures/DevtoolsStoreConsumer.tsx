import { ReactElement } from "react";
import { useDevtoolsStore } from "../../../../store";

function DevtoolsStoreConsumer(): ReactElement {
  const {
    activeTab,
    events,
    filter,
    isMinimized,
    isOpen,
    isPaused,
    maxEvents,
    setActiveTab,
    setFilter,
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
    setActiveTab: state.setActiveTab,
    setFilter: state.setFilter,
    toggleMinimized: state.toggleMinimized,
    togglePause: state.togglePause,
  }));

  const selectStats = (): void => {
    setActiveTab("stats");
  };

  const setPersistedSearch = (): void => {
    setFilter({ search: "persisted custom search" });
  };

  return (
    <div>
      <span>Observed events: {events.map((event) => event.blockerId).join(", ")}</span>
      <span>Configured maximum: {maxEvents}</span>
      <span>Configured open state: {isOpen ? "open" : "closed"}</span>
      <span>Active preference: {activeTab}</span>
      <span>Search preference: {filter.search}</span>
      <span>Minimized preference: {isMinimized ? "minimized" : "expanded"}</span>
      <button onClick={selectStats}>Set stats preference</button>
      <button onClick={setPersistedSearch}>Set search preference</button>
      <button onClick={toggleMinimized}>Toggle minimized preference</button>
      <button onClick={togglePause}>{isPaused ? "Resume consumer" : "Pause consumer"}</button>
    </div>
  );
}

export default DevtoolsStoreConsumer;
