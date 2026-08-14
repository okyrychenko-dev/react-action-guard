import { type StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import { useOptionalUIBlockingContext } from "./UIBlockingContext";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Hook to get the optional context store (returns null if not inside provider)
 * @internal
 */
function useOptionalContextStore(): StoreApi<UIBlockingStore> | null {
  return useOptionalUIBlockingContext();
}

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
export function useResolvedStoreApi(): StoreApi<UIBlockingStore> {
  const contextStore = useOptionalContextStore();
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
export function useResolvedValue<T>(selector: (state: UIBlockingStore) => T): T {
  const store = useResolvedStoreApi();
  return useStore(store, useShallow(selector));
}

/**
 * @deprecated Use `useResolvedStoreApi`.
 */
export const useResolvedStore = useResolvedStoreApi;
/**
 * @deprecated Use `useResolvedValue`.
 */
export const useResolvedStoreWithSelector = useResolvedValue;
