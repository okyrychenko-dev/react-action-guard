import { ActionGuardDevtools } from "@devtools/components/actionGuardDevtools";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "@devtools/middleware";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { ReactElement, useCallback, useState } from "react";

const RESERVED_SESSION_MIDDLEWARE_NAME = `${DEVTOOLS_MIDDLEWARE_NAME}-observation-session`;

interface ManualCustomObservationContentProps {
  onReservedMiddlewareCall: VoidFunction;
}

function ManualCustomObservationContent(props: ManualCustomObservationContentProps): ReactElement {
  const { onReservedMiddlewareCall } = props;
  const store = useUIBlockingContext();
  const [isObserving, setIsObserving] = useState(true);
  const [manualMiddleware] = useState(createDevtoolsMiddleware);

  const handleFixtureElement = useCallback(
    (element: HTMLDivElement | null): void => {
      const { registerMiddleware, unregisterMiddleware } = store.getState();

      if (isDefined(element)) {
        registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);
        registerMiddleware(RESERVED_SESSION_MIDDLEWARE_NAME, onReservedMiddlewareCall);
        return;
      }

      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
      unregisterMiddleware(RESERVED_SESSION_MIDDLEWARE_NAME);
    },
    [manualMiddleware, onReservedMiddlewareCall, store]
  );

  const addBlocker = (): void => {
    const { addBlocker: addStoreBlocker } = store.getState();

    addStoreBlocker("manual-custom-blocker");
  };

  const toggleObservation = (): void => {
    setIsObserving((current) => !current);
  };

  return (
    <div ref={handleFixtureElement}>
      <button onClick={addBlocker}>Add manually observed custom blocker</button>
      <button onClick={toggleObservation}>Toggle manual custom observation</button>
      {isObserving && <ActionGuardDevtools store={store} defaultOpen={true} />}
    </div>
  );
}

export default ManualCustomObservationContent;
