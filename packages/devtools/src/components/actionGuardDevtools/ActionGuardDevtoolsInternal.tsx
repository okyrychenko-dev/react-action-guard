import { ReactElement } from "react";
import { DevtoolsStoreProvider } from "../../store";
import { resolveDevtoolsObservationSession } from "./acquireDevtoolsMiddleware";
import ActionGuardDevtoolsSession from "./ActionGuardDevtoolsSession";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsInternal(
  props: Omit<ActionGuardDevtoolsProps, "showInProduction">
): ReactElement {
  const { store: customStore } = props;
  const { observationSession, targetStore } = resolveDevtoolsObservationSession(customStore);

  return (
    <DevtoolsStoreProvider store={observationSession.devtoolsStore}>
      <ActionGuardDevtoolsSession
        {...props}
        observationSession={observationSession}
        targetStore={targetStore}
      />
    </DevtoolsStoreProvider>
  );
}

export default ActionGuardDevtoolsInternal;
