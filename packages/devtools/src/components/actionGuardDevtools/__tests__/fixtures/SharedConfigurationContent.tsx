import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import { ActionGuardDevtools, ActionGuardDevtoolsProvider } from "../..";
import DevtoolsStoreConsumer from "./DevtoolsStoreConsumer";

function SharedConfigurationContent(): ReactElement {
  const store = useUIBlockingContext();

  return (
    <ActionGuardDevtoolsProvider store={store}>
      <ActionGuardDevtools store={store} defaultOpen={true} maxEvents={1} />
      <ActionGuardDevtools store={store} defaultOpen={false} maxEvents={2} />
      <DevtoolsStoreConsumer />
    </ActionGuardDevtoolsProvider>
  );
}

export default SharedConfigurationContent;
