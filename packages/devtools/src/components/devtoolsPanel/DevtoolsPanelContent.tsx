import { ReactElement } from "react";
import { ActiveBlockers } from "../activeBlockers";
import { ErrorBoundary } from "../shared";
import { Stats } from "../stats";
import { Timeline } from "../timeline";
import type { Optional } from "@okyrychenko-dev/type-utils";
import type { DevtoolsState } from "../../types";
import type { DevtoolsInspection, UIBlockingStoreApi } from "../actionGuardDevtools";

interface DevtoolsPanelContentProps {
  activeTab: DevtoolsState["activeTab"];
  store?: UIBlockingStoreApi;
  stuckThresholdMs?: number;
  inspection?: DevtoolsInspection;
}

function renderTab(
  activeTab: DevtoolsState["activeTab"],
  store: Optional<UIBlockingStoreApi>,
  stuckThresholdMs: Optional<number>,
  inspection: Optional<DevtoolsInspection>
): ReactElement {
  switch (activeTab) {
    case "blockers":
      return (
        <ActiveBlockers store={store} stuckThresholdMs={stuckThresholdMs} inspection={inspection} />
      );
    case "stats":
      return <Stats />;
    case "timeline":
    default:
      return <Timeline />;
  }
}

function DevtoolsPanelContent(props: DevtoolsPanelContentProps): ReactElement {
  const { activeTab, store, stuckThresholdMs, inspection } = props;

  return <ErrorBoundary>{renderTab(activeTab, store, stuckThresholdMs, inspection)}</ErrorBoundary>;
}

export default DevtoolsPanelContent;
