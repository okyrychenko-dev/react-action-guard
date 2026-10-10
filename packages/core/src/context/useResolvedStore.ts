import { createResolvedStoreHooks } from "@okyrychenko-dev/react-zustand-toolkit";
import { uiBlockingStoreApi } from "../store/uiBlockingStore.store";
import { useOptionalUIBlockingContext } from "./UIBlockingContext";
import type { StoreApi } from "zustand";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

const { useResolvedStoreApi: useToolkitStoreApi, useResolvedValue: useToolkitValue } =
  createResolvedStoreHooks(uiBlockingStoreApi, useOptionalUIBlockingContext);

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
  return useToolkitStoreApi();
}

/**
 * Hook to use the resolved store with a selector
 *
 * Uses toolkit shallow comparison by default, or the supplied domain equality.
 *
 * @param selector - Selector function to pick state from the store
 * @param equalityFn - Optional comparison retaining equivalent selected values
 * @returns Selected state value
 */
export function useResolvedValue<T>(
  selector: (state: UIBlockingStore) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  return useToolkitValue(selector, equalityFn);
}

/**
 * @deprecated Use `useResolvedStoreApi`.
 */
export const useResolvedStore = useResolvedStoreApi;
/**
 * @deprecated Use `useResolvedValue`.
 */
export const useResolvedStoreWithSelector = useResolvedValue;
