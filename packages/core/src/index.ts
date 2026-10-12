import {
  UIBlockingProvider,
  useIsInsideUIBlockingProvider,
  useOptionalUIBlockingContext,
  useResolvedStoreApi,
  useResolvedValue,
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "./context";

// Core hooks
export {
  useAsyncAction,
  useActionBlocker,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- Kept as a public compatibility alias.
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
export { createBlockingLifecycle } from "./store/blockingLifecycle";
export type {
  BlockingEvent,
  BlockingLifecycle,
  BlockingLifecycleObservation,
  BlockingLifecycleSnapshot,
} from "./store/blockingLifecycle";
export { useUIBlockingStore, uiBlockingStoreApi } from "./store/uiBlockingStore.store";

// Store types
export type {
  BlockerConfig,
  BlockerInfo,
  UIBlockingStore,
  UIBlockingStoreActions,
  UIBlockingStoreState,
} from "./store/uiBlockingStore.types";

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
export {
  DEFAULT_SCOPE,
  normalizeScope,
  resolveScope,
  scopeAffectsObservation,
  scopeMatchesTarget,
} from "./store/scope";
export type { Scope } from "./store/scope";

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

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Kept as public compatibility aliases.
export { useOptionalContext, useResolvedStore, useResolvedStoreWithSelector } from "./context";
