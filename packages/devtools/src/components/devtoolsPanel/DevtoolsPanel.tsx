import { ReactElement } from "react";
import { useDevtoolsStore } from "../../store";
import { getPanelClassName } from "./DevtoolsPanel.utils";
import DevtoolsPanelContent from "./DevtoolsPanelContent";
import DevtoolsPanelHeader from "./DevtoolsPanelHeader";
import DevtoolsPanelTabs from "./DevtoolsPanelTabs";
import type { DevtoolsPosition } from "../../types";
import type { UIBlockingStoreApi } from "../actionGuardDevtools";

interface DevtoolsPanelProps {
  position: DevtoolsPosition;
  store?: UIBlockingStoreApi;
  stuckThresholdMs?: number;
}

function DevtoolsPanel(props: DevtoolsPanelProps): ReactElement | null {
  const { position, store, stuckThresholdMs } = props;

  const {
    isOpen,
    isMinimized,
    activeTab,
    setActiveTab,
    toggleOpen,
    toggleMinimized,
    clearEvents,
    isPaused,
    togglePause,
    events,
  } = useDevtoolsStore((state) => ({
    isOpen: state.isOpen,
    isMinimized: state.isMinimized,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    toggleOpen: state.toggleOpen,
    toggleMinimized: state.toggleMinimized,
    clearEvents: state.clearEvents,
    isPaused: state.isPaused,
    togglePause: state.togglePause,
    events: state.events,
  }));

  if (!isOpen) {
    return null;
  }

  return (
    <div className={getPanelClassName(position, isMinimized)}>
      <DevtoolsPanelHeader
        eventsCount={events.length}
        isPaused={isPaused}
        isMinimized={isMinimized}
        onTogglePause={togglePause}
        onClearEvents={clearEvents}
        onToggleMinimized={toggleMinimized}
        onClose={toggleOpen}
      />

      {!isMinimized && (
        <>
          <DevtoolsPanelTabs activeTab={activeTab} onSelectTab={setActiveTab} />
          <DevtoolsPanelContent
            activeTab={activeTab}
            store={store}
            stuckThresholdMs={stuckThresholdMs}
          />
        </>
      )}
    </div>
  );
}

export default DevtoolsPanel;
