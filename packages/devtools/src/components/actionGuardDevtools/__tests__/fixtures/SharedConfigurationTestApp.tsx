import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import SharedConfigurationContent from "./SharedConfigurationContent";

function SharedConfigurationTestApp(): ReactElement {
  return (
    <UIBlockingProvider>
      <SharedConfigurationContent />
    </UIBlockingProvider>
  );
}

export default SharedConfigurationTestApp;
