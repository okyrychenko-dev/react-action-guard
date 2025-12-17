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
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
} from "./context";
export type { UIBlockingProviderProps } from "./context";
