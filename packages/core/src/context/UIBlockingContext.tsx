import { createStoreProvider } from "@okyrychenko-dev/react-zustand-toolkit";
import { type ReactNode } from "react";
import { type StoreApi } from "zustand";
import { createUIBlockingActions } from "../store/uiBlockingStore.actions";
import type { Middleware } from "../middleware";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Props for the {@link UIBlockingProvider} component.
 *
 * Configures an isolated UI blocking store instance for a subtree of your app.
 * Useful for SSR, testing, micro-frontends, or any scenario where you need
 * independent blocking state.
 *
 * @public
 * @since 0.6.0
 */
export interface UIBlockingProviderProps {
  children: ReactNode;
  /** Initial middlewares to register */
  middlewares?: ReadonlyArray<Middleware>;
}

/**
 * Base provider implementation created using toolkit's createStoreProvider.
 * @internal
 */
const {
  Provider: BaseUIBlockingProvider,
  useContextStoreApi: useUIBlockingContext,
  useContextStore: baseUseUIBlockingStoreFromContext,
  useIsInsideProvider: useIsInsideUIBlockingProvider,
  useProviderStoreOptional: useOptionalUIBlockingContext,
} = createStoreProvider<UIBlockingStore>(() => createUIBlockingActions, "UIBlocking");

export function useUIBlockingStoreFromContext(): UIBlockingStore;
export function useUIBlockingStoreFromContext<T>(
  selector: (state: UIBlockingStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
export function useUIBlockingStoreFromContext<T>(
  selector?: (state: UIBlockingStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T | UIBlockingStore {
  if (selector) {
    return baseUseUIBlockingStoreFromContext(selector, equalityFn);
  }

  return baseUseUIBlockingStoreFromContext();
}

/**
 * Provider component for isolated UI blocking state management.
 *
 * @public
 * @since 0.6.0
 * @see {@link useUIBlockingContext} to access the store from context
 * @see {@link useIsInsideUIBlockingProvider} to check if inside a provider
 * @see {@link UIBlockingProviderProps} for prop details
 */
export function UIBlockingProvider({
  children,
  middlewares = [],
}: UIBlockingProviderProps): ReactNode {
  const handleStoreInit = (store: StoreApi<UIBlockingStore>): void => {
    const { observeBlockingEvents } = store.getState();

    middlewares.forEach((middleware) => {
      observeBlockingEvents(middleware);
    });
  };

  return (
    <BaseUIBlockingProvider input={undefined} onStoreInit={handleStoreInit}>
      {children}
    </BaseUIBlockingProvider>
  );
}

/**
 * Hook to access the store API from {@link UIBlockingProvider} context.
 * Returns the Zustand store API for the nearest UIBlockingProvider ancestor.
 * Throws an error if called outside a provider.
 * Use this when you need direct access to the store API (for subscribing,
 * getting state snapshots, etc.) rather than reactive hook access.
 *
 * @public
 * @since 0.6.0
 * @see {@link useUIBlockingStoreFromContext} for reactive hook access
 * @see {@link UIBlockingProvider} for provider setup
 */

/**
 * Hook to access UI blocking store state from {@link UIBlockingProvider} context.
 * Works like {@link useUIBlockingStore} but uses the provider's isolated store
 * instead of the global store. Supports selective subscriptions for performance.
 *
 * @public
 * @since 0.6.0
 * @see {@link useUIBlockingContext} for store API access
 * @see {@link UIBlockingProvider} for provider setup
 */

/**
 * Hook to check if the component is inside a {@link UIBlockingProvider}.
 * Returns true if the component is rendered within a UIBlockingProvider,
 * false otherwise. Useful for conditional logic or debugging.
 *
 * @public
 * @since 0.6.0
 * @see {@link UIBlockingProvider} for provider setup
 */

// Export hooks from base provider
export {
  useUIBlockingContext,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  /** @deprecated Use `useOptionalUIBlockingContext`. */
  useOptionalUIBlockingContext as useOptionalContext,
};
