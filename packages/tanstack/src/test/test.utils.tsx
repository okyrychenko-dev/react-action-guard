import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { ReactElement, ReactNode, StrictMode } from "react";

/**
 * Helper to execute an async function with proper act() wrapping
 * while preserving type information.
 */
export async function actAsync<T>(fn: () => Promise<T>): Promise<T> {
  return await act(async () => {
    return await fn();
  });
}

interface CreateWrapperOptions {
  blockingProvider?: boolean;
  strictMode?: boolean;
}

// Helper to create a wrapper with QueryClient
export function createWrapper(options: CreateWrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return function ({ children }: { children: ReactNode }): ReactElement {
    let content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    if (options.blockingProvider) {
      content = <UIBlockingProvider>{content}</UIBlockingProvider>;
    }

    if (options.strictMode) {
      return <StrictMode>{content}</StrictMode>;
    }

    return content;
  };
}
