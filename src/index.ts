import {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useResolvedStoreApi,
  useResolvedValue,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "./context";
import type { UIBlockingStore } from "./store";
import type { StoreApi } from "zustand";

// Core hooks
export {
  useAsyncAction,
  useBlocker,
  useBlockingInfo,
  useConditionalBlocker,
  useConfirmableBlocker,
  useIsBlocked,
  useScheduledBlocker,
} from "./hooks";

// Hook types
export type {
  BlockingSchedule,
  ConditionalBlockerConfig,
  ConfirmableBlockerConfig,
  ConfirmDialogConfig,
  ScheduledBlockerConfig,
  UseAsyncActionOptions,
  UseConfirmableBlockerReturn,
} from "./hooks";

// Store
export { useUIBlockingStore, uiBlockingStoreApi } from "./store";
export type { ShallowStoreBindings } from "./store";

// Store types
export type {
  BlockerConfig,
  BlockerInfo,
  StoredBlocker,
  UIBlockingStore,
  UIBlockingStoreActions,
  UIBlockingStoreState,
} from "./store";

// Middleware
export {
  type AmplitudeConfig,
  type AnalyticsConfig,
  type AnalyticsEventData,
  type AnalyticsProvider,
  type BlockingAction,
  configureMiddleware,
  createAnalyticsMiddleware,
  createPerformanceMiddleware,
  type CustomAnalyticsConfig,
  type GoogleAnalyticsConfig,
  loggerMiddleware,
  type Middleware,
  type MiddlewareContext,
  type MixpanelConfig,
  type PerformanceConfig,
} from "./middleware";

// Type-safe scope utilities
export { createTypedHooks, type TypedHooks } from "./createTypedHooks";
export type { BlockerConfigTyped, DefaultScopes, ScopeValue } from "./types";

// Context / Provider
export {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useResolvedStoreApi,
  useResolvedValue,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
};
export type { UIBlockingProviderProps } from "./context";

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
