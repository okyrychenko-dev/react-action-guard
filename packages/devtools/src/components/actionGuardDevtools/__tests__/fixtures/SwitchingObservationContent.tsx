import {
  ActionGuardDevtools,
  ActionGuardDevtoolsProvider,
  type UIBlockingStoreApi,
} from "@devtools/components/actionGuardDevtools";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useState } from "react";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";

interface SwitchingObservationContentProps {
  firstStore: UIBlockingStoreApi;
}

function SwitchingObservationContent(props: SwitchingObservationContentProps): ReactElement {
  const { firstStore } = props;
  const secondStore = useUIBlockingContext();
  const [isObservingFirst, setIsObservingFirst] = useState(true);
  const observedStore = isObservingFirst ? firstStore : secondStore;

  const addFirstBlocker = (): void => {
    const { addBlocker } = firstStore.getState();

    addBlocker("first-store-blocker");
  };

  const addSecondBlocker = (): void => {
    const { addBlocker } = secondStore.getState();

    addBlocker("second-store-blocker");
  };

  const switchStore = (): void => {
    setIsObservingFirst((current) => !current);
  };

  return (
    <ActionGuardDevtoolsProvider store={observedStore}>
      <button onClick={addFirstBlocker}>Add first-store blocker</button>
      <button onClick={addSecondBlocker}>Add second-store blocker</button>
      <button onClick={switchStore}>Switch observed store</button>
      <ActionGuardDevtools store={observedStore} />
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default SwitchingObservationContent;
