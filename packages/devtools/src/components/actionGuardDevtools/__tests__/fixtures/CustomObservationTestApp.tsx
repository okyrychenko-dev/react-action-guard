import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import CustomObservationContent from "./CustomObservationContent";

function CustomObservationTestApp(): ReactElement {
  return (
    <UIBlockingProvider>
      <CustomObservationContent />
    </UIBlockingProvider>
  );
}

export default CustomObservationTestApp;
