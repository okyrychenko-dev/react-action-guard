import { DashboardSessionProvider } from "@features/dashboard";
import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { AppProvidersRenderProps } from "./AppProviders.types";

interface DemoSessionProps extends AppProvidersRenderProps {
  children: (props: AppProvidersRenderProps) => ReactNode;
}

export function DemoSession({ children, demoKey, onReset }: DemoSessionProps): ReactElement {
  const store = useResolvedStoreApi();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      })
  );

  useEffect(
    () => () => {
      queryClient.clear();
    },
    [queryClient]
  );

  const handleReset = (): void => {
    const { clearAllBlockers } = store.getState();
    clearAllBlockers();
    onReset();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardSessionProvider>
        {children({ demoKey, onReset: handleReset })}
      </DashboardSessionProvider>
    </QueryClientProvider>
  );
}
