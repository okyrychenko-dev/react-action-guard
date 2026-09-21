import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import CustomObservationContent from "./CustomObservationContent";

interface CustomObservationTestAppProps {
  defaultOpen?: boolean;
  label?: string;
  maxEvents?: number;
}

function CustomObservationTestApp(props: CustomObservationTestAppProps): ReactElement {
  const { defaultOpen, label = "custom observation", maxEvents } = props;

  return (
    <section aria-label={label}>
      <UIBlockingProvider>
        <CustomObservationContent defaultOpen={defaultOpen} maxEvents={maxEvents} />
      </UIBlockingProvider>
    </section>
  );
}

export default CustomObservationTestApp;
