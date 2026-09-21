import { ReactElement, useEffect } from "react";
import { DevtoolsStoreProvider } from "../../store";
import {
  acquireDevtoolsMiddleware,
  resolveDevtoolsObservationSession,
} from "./acquireDevtoolsMiddleware";
import type { ActionGuardDevtoolsProviderProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsProviderInternal(
  props: Omit<ActionGuardDevtoolsProviderProps, "showInProduction">
): ReactElement {
  const { children, store: customStore } = props;
  const { observationSession, targetStore } = resolveDevtoolsObservationSession(customStore);

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
