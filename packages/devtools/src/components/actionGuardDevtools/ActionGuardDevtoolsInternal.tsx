import { ReactElement } from "react";
import { DevtoolsStoreProvider } from "../../store";
import { resolveDevtoolsObservationSession } from "./acquireDevtoolsMiddleware";
import ActionGuardDevtoolsSession from "./ActionGuardDevtoolsSession";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsInternal(
  props: Omit<ActionGuardDevtoolsProps, "showInProduction">
): ReactElement {
  const { store: customStore } = props;
  const observationSession = resolveDevtoolsObservationSession(customStore);

  return (
    <DevtoolsStoreProvider store={observationSession.devtoolsStore}>
      <ActionGuardDevtoolsSession {...props} observationSession={observationSession} />
    </DevtoolsStoreProvider>
  );
}

export default ActionGuardDevtoolsInternal;
