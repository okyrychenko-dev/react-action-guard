import { ReactElement } from "react";
import { useIsomorphicLayoutEffect } from "../../hooks";
import { DevtoolsStoreProvider } from "../../store";
import { resolveDevtoolsObservationSession } from "./acquireDevtoolsMiddleware";
import type { ActionGuardDevtoolsProviderProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsProviderInternal(
  props: Omit<ActionGuardDevtoolsProviderProps, "showInProduction">
): ReactElement {
  const { children, store: customStore } = props;
  const observationSession = resolveDevtoolsObservationSession(customStore);

  useIsomorphicLayoutEffect(() => {
    const { release } = observationSession.participate();

    return release;
  }, [observationSession]);

  return (
    <DevtoolsStoreProvider store={observationSession.devtoolsStore}>
      {children}
    </DevtoolsStoreProvider>
  );
}

export default ActionGuardDevtoolsProviderInternal;
