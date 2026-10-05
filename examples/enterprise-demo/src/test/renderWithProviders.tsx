import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { useState } from "react";
import type { ReactNode } from "react";

export interface RenderWithProvidersOptions extends RenderOptions {
  children?: ReactNode;
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({ children }: { children: ReactNode }): ReactNode {
  const [queryClient] = useState(createTestQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function renderWithProviders(
  ui: ReactNode,
  { children, ...options }: RenderWithProvidersOptions = {}
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  function Wrapper({ children: wrapperChildren }: { children: ReactNode }): ReactNode {
    return (
      <QueryClientProvider client={queryClient}>{children ?? wrapperChildren}</QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
