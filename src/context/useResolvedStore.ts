import { useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import { UIBlockingContext } from "./UIBlockingContext.internal";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Internal context export for useResolvedStore
 * Re-exported to avoid circular dependencies
 */
export { UIBlockingContext } from "./UIBlockingContext.internal";

/**
 * Hook that resolves to either the context store or global store
 *
 * This hook automatically uses the store from UIBlockingProvider if available,
 * otherwise falls back to the global store. This enables both patterns:
 *
 * 1. Global store (default behavior, no Provider needed)
 * 2. Context store (for SSR, testing, micro-frontends)
 *
 * @returns The resolved store API
 */
export function useResolvedStore(): StoreApi<UIBlockingStore> {
  const contextStore = useContext(UIBlockingContext);
  // Return context store if inside Provider, otherwise global store
  return contextStore ?? uiBlockingStoreApi;
}

/**
 * Hook to use the resolved store with a selector
 *
 * Automatically applies shallow comparison to prevent unnecessary re-renders.
 *
 * @param selector - Selector function to pick state from the store
 * @returns Selected state value
 */
export function useResolvedStoreWithSelector<T>(selector: (state: UIBlockingStore) => T): T {
  const store = useResolvedStore();
  return useStore(store, useShallow(selector));
}
