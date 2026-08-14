import { ReactElement } from "react";
import { ActiveBlockers } from "../activeBlockers";
import { ErrorBoundary } from "../shared";
import { Stats } from "../stats";
import { Timeline } from "../timeline";
import type { DevtoolsState } from "../../types";
import type { UIBlockingStoreApi } from "../actionGuardDevtools";

interface DevtoolsPanelContentProps {
  activeTab: DevtoolsState["activeTab"];
  store?: UIBlockingStoreApi;
  stuckThresholdMs?: number;
}

function renderTab(
  activeTab: DevtoolsState["activeTab"],
  store: UIBlockingStoreApi | undefined,
  stuckThresholdMs: number | undefined
): ReactElement {
  switch (activeTab) {
    case "blockers":
      return <ActiveBlockers store={store} stuckThresholdMs={stuckThresholdMs} />;
    case "stats":
      return <Stats />;
    case "timeline":
    default:
      return <Timeline />;
  }
}

function DevtoolsPanelContent(props: DevtoolsPanelContentProps): ReactElement {
  const { activeTab, store, stuckThresholdMs } = props;

  return <ErrorBoundary>{renderTab(activeTab, store, stuckThresholdMs)}</ErrorBoundary>;
}

export default DevtoolsPanelContent;
