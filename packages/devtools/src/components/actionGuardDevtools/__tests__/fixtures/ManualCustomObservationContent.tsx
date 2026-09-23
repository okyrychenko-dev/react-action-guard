import { ActionGuardDevtools } from "@devtools/components/actionGuardDevtools";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "@devtools/middleware";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { type Nullable, isDefined } from "@okyrychenko-dev/type-utils";
import { ReactElement, useCallback, useState } from "react";

const RESERVED_SESSION_MIDDLEWARE_NAME = `${DEVTOOLS_MIDDLEWARE_NAME}-observation-session`;

interface ManualCustomObservationContentProps {
  onReservedMiddlewareCall: VoidFunction;
  registerManualBeforeObservation?: boolean;
}

function ManualCustomObservationContent(props: ManualCustomObservationContentProps): ReactElement {
  const { onReservedMiddlewareCall, registerManualBeforeObservation = true } = props;

  const store = useUIBlockingContext();
  const [isObserving, setIsObserving] = useState(true);
  const [manualMiddleware] = useState(createDevtoolsMiddleware);

  const registerManualMiddleware = (): void => {
    const { registerMiddleware } = store.getState();

    registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);
  };

  const handleFixtureElement = useCallback(
    (element: Nullable<HTMLDivElement>): void => {
      const { registerMiddleware, unregisterMiddleware } = store.getState();

      if (isDefined(element)) {
        if (registerManualBeforeObservation) {
          registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);
          registerMiddleware(RESERVED_SESSION_MIDDLEWARE_NAME, onReservedMiddlewareCall);
        }

        return;
      }

      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
      unregisterMiddleware(RESERVED_SESSION_MIDDLEWARE_NAME);
    },
    [manualMiddleware, onReservedMiddlewareCall, registerManualBeforeObservation, store]
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
      <button onClick={registerManualMiddleware}>Register manual custom middleware</button>
      <button onClick={toggleObservation}>Toggle manual custom observation</button>
      {isObserving && <ActionGuardDevtools store={store} defaultOpen={true} />}
    </div>
  );
}

export default ManualCustomObservationContent;
