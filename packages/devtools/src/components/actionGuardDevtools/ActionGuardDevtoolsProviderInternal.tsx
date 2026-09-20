import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useEffect } from "react";
import { DevtoolsStoreProvider, devtoolsStoreApi } from "../../store";
import {
  acquireDevtoolsMiddleware,
  getDevtoolsObservationSession,
} from "./acquireDevtoolsMiddleware";
import type { ActionGuardDevtoolsProviderProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsProviderInternal(
  props: Omit<ActionGuardDevtoolsProviderProps, "showInProduction">
): ReactElement {
  const { children, store: customStore } = props;

  const targetStore = customStore ?? uiBlockingStoreApi;
  const observationSession = getDevtoolsObservationSession(
    targetStore,
    targetStore === uiBlockingStoreApi ? devtoolsStoreApi : undefined
  );

  useEffect(
    () => acquireDevtoolsMiddleware(targetStore, observationSession),
    [observationSession, targetStore]
  );

  return (
    <DevtoolsStoreProvider store={observationSession.devtoolsStore}>
      {children}
    </DevtoolsStoreProvider>
  );
}

export default ActionGuardDevtoolsProviderInternal;
