import {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "./UIBlockingContext";
import { useResolvedStoreApi, useResolvedValue } from "./useResolvedStore";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";
import type { StoreApi } from "zustand";

export {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
};
export type { UIBlockingProviderProps } from "./UIBlockingContext";
export { useResolvedStoreApi, useResolvedValue };

/**
 * @deprecated Use `useOptionalUIBlockingContext`.
 */
export function useOptionalContext(): ReturnType<typeof useOptionalUIBlockingContext> {
  return useOptionalUIBlockingContext();
}

/**
 * @deprecated Use `useResolvedStoreApi`.
 */
export function useResolvedStore(): StoreApi<UIBlockingStore> {
  return useResolvedStoreApi();
}

/**
 * @deprecated Use `useResolvedValue`.
 */
export function useResolvedStoreWithSelector<T>(selector: (state: UIBlockingStore) => T): T {
  return useResolvedValue(selector);
}
