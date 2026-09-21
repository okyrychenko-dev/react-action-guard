import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { ReactElement } from "react";
import CustomObservationContent from "./CustomObservationContent";

interface CustomObservationTestAppProps {
  defaultOpen?: boolean;
  hasInitialBlocker?: boolean;
  label?: string;
  maxEvents?: number;
}

function CustomObservationTestApp(props: CustomObservationTestAppProps): ReactElement {
  const { defaultOpen, hasInitialBlocker, label = "custom observation", maxEvents } = props;

  return (
    <section aria-label={label}>
      <UIBlockingProvider>
        <CustomObservationContent
          defaultOpen={defaultOpen}
          hasInitialBlocker={hasInitialBlocker}
          maxEvents={maxEvents}
        />
      </UIBlockingProvider>
    </section>
  );
}

export default CustomObservationTestApp;
