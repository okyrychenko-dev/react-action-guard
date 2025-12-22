import { createStoreProvider } from "@okyrychenko-dev/react-zustand-toolkit";
import { type ReactNode } from "react";
import { type StoreApi } from "zustand";
import { createUIBlockingActions } from "../store/uiBlockingStore.actions";
import type { Middleware } from "../middleware";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Props for UIBlockingProvider component
 */
export interface UIBlockingProviderProps {
  children: ReactNode;
  /** Enable Redux DevTools integration (default: true in development) */
  enableDevtools?: boolean;
  /** Name for Redux DevTools (default: "UIBlocking") */
  devtoolsName?: string;
  /** Initial middlewares to register */
  middlewares?: ReadonlyArray<Middleware>;
}

/**
 * Base provider created using toolkit's createStoreProvider
 * This creates isolated store instances for SSR, testing, and micro-frontends
 */
const {
  Provider: BaseUIBlockingProvider,
  useContext: useUIBlockingContext,
  useContextStore: useUIBlockingStoreFromContext,
  useIsInsideProvider: useIsInsideUIBlockingProvider,
  useOptionalContext,
} = createStoreProvider(createUIBlockingActions, "UIBlocking");

/**
 * Provider component for isolated UI blocking state
 *
 * Uses toolkit's createStoreProvider with built-in DevTools support
 * and onStoreCreate callback for middleware registration.
 */
export function UIBlockingProvider({
  children,
  enableDevtools = process.env.NODE_ENV === "development",
  devtoolsName = "UIBlocking",
  middlewares = [],
}: UIBlockingProviderProps): ReactNode {
  const handleStoreCreate = (store: StoreApi<UIBlockingStore>): void => {
    // Register initial middlewares
    middlewares.forEach((mw, index) => {
      store.getState().registerMiddleware(`provider-middleware-${index.toString()}`, mw);
    });
  };

  return (
    <BaseUIBlockingProvider
      enableDevtools={enableDevtools}
      devtoolsName={devtoolsName}
      onStoreCreate={handleStoreCreate}
    >
      {children}
    </BaseUIBlockingProvider>
  );
}

// Export hooks from base provider
export {
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
  useIsInsideUIBlockingProvider,
  useOptionalContext,
};
