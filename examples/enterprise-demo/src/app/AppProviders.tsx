import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import { DemoSession } from "./DemoSession";
import type { ReactElement, ReactNode } from "react";
import type { AppProvidersRenderProps } from "./AppProviders.types";

export type { AppProvidersRenderProps } from "./AppProviders.types";

interface AppProvidersProps {
  children: (props: AppProvidersRenderProps) => ReactNode;
}

export function AppProviders(props: AppProvidersProps): ReactElement {
  const { children } = props;

  const [demoKey, setDemoKey] = useState(0);

  const handleReset: VoidFunction = () => {
    setDemoKey((key) => key + 1);
  };

  return (
    <UIBlockingProvider key={demoKey}>
      <DemoSession demoKey={demoKey} onReset={handleReset}>
        {children}
      </DemoSession>
    </UIBlockingProvider>
  );
}
