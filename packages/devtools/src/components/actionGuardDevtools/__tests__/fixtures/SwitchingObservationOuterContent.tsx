import { UIBlockingProvider, useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import SwitchingObservationContent from "./SwitchingObservationContent";

function SwitchingObservationOuterContent(): ReactElement {
  const firstStore = useUIBlockingContext();

  return (
    <UIBlockingProvider>
      <SwitchingObservationContent firstStore={firstStore} />
    </UIBlockingProvider>
  );
}

export default SwitchingObservationOuterContent;
