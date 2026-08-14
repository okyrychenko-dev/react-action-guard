import { ReactElement } from "react";
import { DevtoolsPanel } from "../devtoolsPanel";
import { ToggleButton } from "../toggleButton";
import type { DevtoolsPosition } from "../../types";
import type { UIBlockingStoreApi } from "./ActionGuardDevtools.types";

interface ActionGuardDevtoolsContentProps {
  position: DevtoolsPosition;
  store?: UIBlockingStoreApi;
  stuckThresholdMs?: number;
}

function ActionGuardDevtoolsContent(props: ActionGuardDevtoolsContentProps): ReactElement {
  const { position, store, stuckThresholdMs } = props;

  return (
    <>
      <ToggleButton position={position} store={store} />
      <DevtoolsPanel position={position} store={store} stuckThresholdMs={stuckThresholdMs} />
    </>
  );
}

export default ActionGuardDevtoolsContent;
