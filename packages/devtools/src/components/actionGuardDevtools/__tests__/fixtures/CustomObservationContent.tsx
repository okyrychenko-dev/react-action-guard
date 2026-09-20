import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useRef } from "react";
import ActionGuardDevtools from "../../ActionGuardDevtools";
import ActionGuardDevtoolsProvider from "../../ActionGuardDevtoolsProvider";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";

function CustomObservationContent(): ReactElement {
  const store = useUIBlockingContext();
  const blockerNumberRef = useRef(0);

  const addBlocker = (): void => {
    blockerNumberRef.current += 1;

    const state = store.getState();

    state.addBlocker(`provider-blocker-${blockerNumberRef.current.toString()}`);
  };

  return (
    <ActionGuardDevtoolsProvider store={store}>
      <button onClick={addBlocker}>Add provider blocker</button>
      <ActionGuardDevtools store={store} />
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default CustomObservationContent;
