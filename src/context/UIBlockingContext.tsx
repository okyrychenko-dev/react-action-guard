import { type ReactNode, useContext, useMemo, useRef } from "react";
import { type StoreApi, createStore, useStore } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { createUIBlockingActions } from "../store/uiBlockingStore.actions";
import { UIBlockingContext } from "./UIBlockingContext.internal";
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
 * Provider component for isolated UI blocking state
 *
 * Use this to create an isolated store instance for:
 * - Server-side rendering (each request gets its own store)
 * - Testing (no need for beforeEach cleanup)
 * - Micro-frontends (isolated state per app)
 *
 * @example
 * ```tsx
 * // SSR - each request gets its own store
 * function App() {
 *   return (
 *     <UIBlockingProvider>
 *       <MyComponent />
 *     </UIBlockingProvider>
 *   );
 * }
 *
 * // Testing - isolated store per test
 * function renderWithProvider(ui: ReactElement) {
 *   return render(
 *     <UIBlockingProvider>{ui}</UIBlockingProvider>
 *   );
 * }
 * ```
 */
export function UIBlockingProvider({
  children,
  enableDevtools = process.env.NODE_ENV === "development",
  devtoolsName = "UIBlocking",
  middlewares = [],
}: UIBlockingProviderProps): ReactNode {
  // Use ref to store middlewares to avoid recreation on every render
  const middlewaresRef = useRef(middlewares);

  const store = useMemo(() => {
    // Create store with or without devtools
    const baseStore = enableDevtools
      ? createStore(
          devtools(createUIBlockingActions, {
            name: devtoolsName,
            enabled: enableDevtools,
          })
        )
      : createStore(createUIBlockingActions);

    // Register initial middlewares
    middlewaresRef.current.forEach((mw, index) => {
      baseStore.getState().registerMiddleware(`provider-middleware-${index.toString()}`, mw);
    });

    return baseStore;
  }, [enableDevtools, devtoolsName]);

  return <UIBlockingContext.Provider value={store}>{children}</UIBlockingContext.Provider>;
}

/**
 * Hook to access the UIBlocking store from context
 *
 * Throws an error if used outside of UIBlockingProvider.
 * Use useUIBlockingStoreFromContext for safe access with fallback.
 *
 * @returns The store API from the nearest UIBlockingProvider
 * @throws Error if used outside of UIBlockingProvider
 */
export function useUIBlockingContext(): StoreApi<UIBlockingStore> {
  const store = useContext(UIBlockingContext);

  if (!store) {
    throw new Error(
      "useUIBlockingContext must be used within UIBlockingProvider. " +
        "Either wrap your app in <UIBlockingProvider> or use the global store via useUIBlockingStore."
    );
  }

  return store;
}

/**
 * Hook to check if we're inside a UIBlockingProvider
 *
 * @returns true if inside UIBlockingProvider, false otherwise
 */
export function useIsInsideUIBlockingProvider(): boolean {
  const store = useContext(UIBlockingContext);
  return store !== null;
}

/**
 * Hook to use the UIBlocking store from context with a selector
 *
 * This is similar to useUIBlockingStore but uses the context store.
 * Automatically applies shallow comparison to prevent unnecessary re-renders.
 *
 * @param selector - Selector function to pick state from the store
 * @returns Selected state value
 * @throws Error if used outside of UIBlockingProvider
 */
export function useUIBlockingStoreFromContext<T>(selector: (state: UIBlockingStore) => T): T {
  const store = useUIBlockingContext();
  return useStore(store, useShallow(selector));
}
