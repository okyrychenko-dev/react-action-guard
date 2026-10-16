import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import type { RenderWithProvidersOptions } from "./renderWithProviders.types";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestProviders(props: PropsWithChildren): ReactNode {
  const { children } = props;

  const [queryClient] = useState(createTestQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function renderWithProviders(
  ui: ReactNode,
  { children, ...options }: RenderWithProvidersOptions = {}
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  function Wrapper(props: PropsWithChildren): ReactNode {
    const { children: wrapperChildren } = props;

    return (
      <QueryClientProvider client={queryClient}>{children ?? wrapperChildren}</QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export type { RenderWithProvidersOptions } from "./renderWithProviders.types";
