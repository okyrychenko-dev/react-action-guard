import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import SwitchingObservationOuterContent from "./SwitchingObservationOuterContent";

function SwitchingObservationTestApp(): ReactElement {
  return (
    <UIBlockingProvider>
      <SwitchingObservationOuterContent />
    </UIBlockingProvider>
  );
}

export default SwitchingObservationTestApp;
