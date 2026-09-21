import {
  ActionGuardDevtools,
  ActionGuardDevtoolsProvider,
} from "@devtools/components/actionGuardDevtools";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useRef } from "react";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";

interface CustomObservationContentProps {
  defaultOpen?: boolean;
  maxEvents?: number;
}

function CustomObservationContent(props: CustomObservationContentProps): ReactElement {
  const { defaultOpen, maxEvents } = props;

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
      <ActionGuardDevtools store={store} defaultOpen={defaultOpen} maxEvents={maxEvents} />
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default CustomObservationContent;
