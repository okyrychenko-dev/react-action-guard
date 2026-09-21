import { ActionGuardDevtools } from "@devtools/components/actionGuardDevtools";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "@devtools/middleware";
import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { ReactElement, useCallback, useRef, useState } from "react";

function ManualCustomObservationContent(): ReactElement {
  const store = useUIBlockingContext();
  const [isObserving, setIsObserving] = useState(true);
  const [manualMiddleware] = useState(createDevtoolsMiddleware);
  const manualMiddlewareRegisteredRef = useRef(false);

  const handleFixtureElement = useCallback(
    (element: HTMLDivElement | null): void => {
      const { registerMiddleware, unregisterMiddleware } = store.getState();

      if (isDefined(element)) {
        if (!manualMiddlewareRegisteredRef.current) {
          registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);

          manualMiddlewareRegisteredRef.current = true;
        }
        return;
      }

      if (!manualMiddlewareRegisteredRef.current) {
        return;
      }

      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);

      manualMiddlewareRegisteredRef.current = false;
    },
    [manualMiddleware, store]
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
