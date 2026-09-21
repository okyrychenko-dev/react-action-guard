import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import { ActionGuardDevtoolsProvider } from "../..";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";

interface ProductionObservationTestAppProps {
  showInProduction?: boolean;
}

function ProductionObservationTestApp(props: ProductionObservationTestAppProps): ReactElement {
  const { showInProduction } = props;

  const addBlocker = (): void => {
    const state = uiBlockingStoreApi.getState();

    state.addBlocker("production-provider-blocker");
  };

  return (
    <ActionGuardDevtoolsProvider store={uiBlockingStoreApi} showInProduction={showInProduction}>
      <button onClick={addBlocker}>Add production blocker</button>
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default ProductionObservationTestApp;
