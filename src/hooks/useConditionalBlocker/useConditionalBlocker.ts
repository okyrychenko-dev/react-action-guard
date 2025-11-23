import { useCallback, useEffect, useRef } from "react";
import { useUIBlockingStore } from "../../store";
import { createBlockerConfig } from "../useBlocker";
import { useConfigRef } from "../useConfigRef";
import { ConditionalBlockerConfig } from "./useConditionalBlocker.types";

/**
 * Hook for conditional blocking based on a condition function.
 *
 * Periodically checks a condition and blocks/unblocks based on the result.
 * The condition is evaluated at the specified interval (default 1000ms).
 *
 * @param blockerId - Unique identifier for this blocker
 * @param config - Configuration including condition function and check interval
 *
 */
export const useConditionalBlocker = <TState = unknown>(
  blockerId: string,
  config: ConditionalBlockerConfig<TState>
): void => {
  const { addBlocker, removeBlocker } = useUIBlockingStore();
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
