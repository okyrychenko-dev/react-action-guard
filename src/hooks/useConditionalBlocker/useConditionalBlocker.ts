import { useCallback, useEffect, useRef } from "react";
import { useResolvedStoreWithSelector } from "../../context";
import { createBlockerConfig } from "../useBlocker";
import { useConfigRef } from "../useConfigRef";
import { ConditionalBlockerConfig } from "./useConditionalBlocker.types";

/**
 * Blocks UI based on a dynamic condition that is periodically evaluated.
 * 
 * Periodically checks a condition function and automatically adds or removes
 * a blocker based on the result. Useful for blocking based on application state,
 * network status, feature flags, or any other dynamic condition.
 * 
 * The condition function receives optional state and returns a boolean.
 * It's evaluated immediately on mount and then at the specified interval.
 * The blocker is added/removed automatically as the condition changes.
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @template TState - Type of the state object passed to the condition function
 * @param blockerId - Unique identifier for this conditional blocker
 * @param config - Configuration for conditional blocking
 * @param config.condition - Function that returns true to block, false to unblock.
 *                           Receives the `state` object as parameter.
 * @param config.state - Optional state object passed to the condition function
 * @param config.checkInterval - How often to check the condition in milliseconds.
 *                               Defaults to 1000ms (1 second). Lower values mean
 *                               more responsive blocking but higher CPU usage.
 * @param config.scope - Scope(s) to block when condition is true
 * @param config.reason - Reason for blocking (displayed to users)
 * @param config.priority - Optional blocker priority (0-100)
 * 
 * @example
 * Block based on network status
 * ```tsx
 * function OfflineBlocker() {
 *   const [isOnline, setIsOnline] = useState(navigator.onLine);
 *   
 *   useEffect(() => {
 *     const handleOnline = () => setIsOnline(true);
 *     const handleOffline = () => setIsOnline(false);
 *     
 *     window.addEventListener('online', handleOnline);
 *     window.addEventListener('offline', handleOffline);
 *     
 *     return () => {
 *       window.removeEventListener('online', handleOnline);
 *       window.removeEventListener('offline', handleOffline);
 *     };
 *   }, []);
 *   
 *   useConditionalBlocker('offline', {
 *     condition: () => !isOnline,
 *     state: { isOnline },
 *     checkInterval: 500, // Check every 500ms
 *     scope: 'global',
 *     reason: 'No internet connection. Please check your network.',
 *     priority: 95
 *   });
 *   
 *   return <App />;
 * }
 * ```
 * 
 * @example
 * Block based on feature flag
 * ```tsx
 * function FeatureFlagBlocker() {
 *   const featureFlags = useFeatureFlags();
 *   
 *   useConditionalBlocker('feature-disabled', {
 *     condition: (state) => !state.featureFlags.newFeatureEnabled,
 *     state: { featureFlags },
 *     checkInterval: 5000, // Check every 5 seconds
 *     scope: 'new-feature',
 *     reason: 'This feature is currently disabled',
 *     priority: 70
 *   });
 *   
 *   return <NewFeature />;
 * }
 * ```
 * 
 * @example
 * Block during API rate limit
 * ```tsx
 * function RateLimitBlocker() {
 *   const [requestCount, setRequestCount] = useState(0);
 *   const [resetTime, setResetTime] = useState<number | null>(null);
 *   
 *   useConditionalBlocker('rate-limit', {
 *     condition: (state) => {
 *       if (!state.resetTime) {
 *         return false;
 *       }
 *       return Date.now() < state.resetTime && state.requestCount >= 100;
 *     },
 *     state: { requestCount, resetTime },
 *     checkInterval: 1000,
 *     scope: 'api',
 *     reason: 'API rate limit reached. Please wait.',
 *     priority: 90
 *   });
 *   
 *   return <Dashboard />;
 * }
 * ```
 * 
 * @example
 * Block based on form validation
 * ```tsx
 * function FormValidationBlocker() {
 *   const { formState } = useFormContext();
 *   
 *   useConditionalBlocker('invalid-form', {
 *     condition: (state) => !state.isValid && state.isDirty,
 *     state: formState,
 *     checkInterval: 500,
 *     scope: 'form-submit',
 *     reason: 'Please fix form errors before submitting',
 *     priority: 60
 *   });
 *   
 *   return <Form />;
 * }
 * ```
 * 
 * @example
 * Without state parameter (simple condition)
 * ```tsx
 * useConditionalBlocker('low-battery', {
 *   condition: () => {
 *     // Check battery level if available
 *     if ('getBattery' in navigator) {
 *       return navigator.getBattery().then(b => b.level < 0.05);
 *     }
 *     return false;
 *   },
 *   checkInterval: 30000, // Check every 30 seconds
 *   scope: 'heavy-operations',
 *   reason: 'Battery level too low for this operation',
 *   priority: 80
 * });
 * ```
 * 
 * @see {@link useBlocker} for simple conditional blocking with boolean
 * @see {@link useScheduledBlocker} for time-based blocking
 * @see {@link ConditionalBlockerConfig} for configuration options
 * 
 * @public
 * @since 0.6.0
 */
export const useConditionalBlocker = <TState = unknown>(
  blockerId: string,
  config: ConditionalBlockerConfig<TState>
): void => {
  const { addBlocker, removeBlocker } = useResolvedStoreWithSelector((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isBlockedRef = useRef(false);
  const configRef = useConfigRef(config);

  const checkCondition = useCallback(() => {
    const currentConfig = configRef.current;
    const shouldBlock = currentConfig.condition(currentConfig.state);

    // No state change needed
    if (shouldBlock === isBlockedRef.current) {
      return;
    }

    if (shouldBlock) {
      addBlocker(blockerId, createBlockerConfig(currentConfig));
    } else {
      removeBlocker(blockerId);
    }
    isBlockedRef.current = shouldBlock;
  }, [blockerId, addBlocker, removeBlocker, configRef]);

  useEffect(() => {
    checkCondition();

    const interval = configRef.current.checkInterval ?? 1000;
    intervalRef.current = setInterval(checkCondition, interval);

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isBlockedRef.current) {
        removeBlocker(blockerId);
        isBlockedRef.current = false;
      }
    };
    // configRef is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkCondition, blockerId, removeBlocker]);
};
