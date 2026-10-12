import { ReactElement } from "react";
import { DevtoolsPanel } from "../devtoolsPanel";
import { ToggleButton } from "../toggleButton";
import type { DevtoolsPosition } from "../../types";
import type { DevtoolsInspection, UIBlockingStoreApi } from "./ActionGuardDevtools.types";

interface ActionGuardDevtoolsContentProps {
  position: DevtoolsPosition;
  store?: UIBlockingStoreApi;
  stuckThresholdMs?: number;
  inspection?: DevtoolsInspection;
}

function ActionGuardDevtoolsContent(props: ActionGuardDevtoolsContentProps): ReactElement {
  const { position, store, stuckThresholdMs, inspection } = props;

  return (
    <>
      <ToggleButton position={position} store={store} />
      <DevtoolsPanel
        position={position}
        store={store}
        stuckThresholdMs={stuckThresholdMs}
        inspection={inspection}
      />
    </>
  );
}

export default ActionGuardDevtoolsContent;
