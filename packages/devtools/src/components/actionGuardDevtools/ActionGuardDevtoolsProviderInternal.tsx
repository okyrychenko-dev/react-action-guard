import { ReactElement, useEffect, useLayoutEffect } from "react";
import { DevtoolsStoreProvider } from "../../store";
import {
  acquireDevtoolsMiddleware,
  resolveDevtoolsObservationSession,
} from "./acquireDevtoolsMiddleware";
import type { ActionGuardDevtoolsProviderProps } from "./ActionGuardDevtools.types";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function ActionGuardDevtoolsProviderInternal(
  props: Omit<ActionGuardDevtoolsProviderProps, "showInProduction">
): ReactElement {
  const { children, store: customStore } = props;
  const observationSession = resolveDevtoolsObservationSession(customStore);

  useIsomorphicLayoutEffect(
    () => acquireDevtoolsMiddleware(observationSession),
    [observationSession]
  );

  return (
    <DevtoolsStoreProvider store={observationSession.devtoolsStore}>
      {children}
    </DevtoolsStoreProvider>
  );
}

export default ActionGuardDevtoolsProviderInternal;
