import {
  ActionGuardDevtools,
  ActionGuardDevtoolsProvider,
} from "@devtools/components/actionGuardDevtools";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useRef, useState } from "react";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";
import InitialPassiveEffectBlockers from "./InitialPassiveEffectBlockers";

interface CustomObservationContentProps {
  defaultOpen?: boolean;
  hasInitialBlocker?: boolean;
  maxEvents?: number;
}

function CustomObservationContent(props: CustomObservationContentProps): ReactElement {
  const { defaultOpen, hasInitialBlocker = false, maxEvents } = props;

  const store = useUIBlockingContext();
  const blockerNumberRef = useRef(0);
  const [isInitialBlockerActive, setIsInitialBlockerActive] = useState(hasInitialBlocker);

  const addBlocker = (): void => {
    blockerNumberRef.current += 1;

    const { addBlocker: addStoreBlocker } = store.getState();

    addStoreBlocker(`provider-blocker-${blockerNumberRef.current.toString()}`);
  };

  const removeInitialBlocker = (): void => {
    setIsInitialBlockerActive(false);
  };

  return (
    <ActionGuardDevtoolsProvider store={store}>
      {hasInitialBlocker ? (
        <InitialPassiveEffectBlockers isActionBlockerActive={isInitialBlockerActive} />
      ) : null}
      <button onClick={addBlocker}>Add provider blocker</button>
      {hasInitialBlocker ? (
        <button onClick={removeInitialBlocker}>Remove initial blocker</button>
      ) : null}
      <ActionGuardDevtools store={store} defaultOpen={defaultOpen} maxEvents={maxEvents} />
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default CustomObservationContent;
