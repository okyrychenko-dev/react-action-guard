import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import { DevtoolsStoreProvider, devtoolsStoreApi } from "../../store";
import { getDevtoolsObservationSession } from "./acquireDevtoolsMiddleware";
import ActionGuardDevtoolsSession from "./ActionGuardDevtoolsSession";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";

function ActionGuardDevtoolsInternal(
  props: Omit<ActionGuardDevtoolsProps, "showInProduction">
): ReactElement {
  const { store: customStore } = props;
  const targetStore = customStore ?? uiBlockingStoreApi;

  const observationSession = getDevtoolsObservationSession(
    targetStore,
    targetStore === uiBlockingStoreApi ? devtoolsStoreApi : undefined
  );

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
