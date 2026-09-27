import { type Nullable, isUndefined } from "@okyrychenko-dev/type-utils";
import { useCallback, useEffect, useRef } from "react";
import { useResolvedValue } from "../../context";
import { createBlockerConfig } from "../useActionBlocker";
import { useConfigRef } from "../useConfigRef";
import { ConditionalBlockerConfig } from "./useConditionalBlocker.types";

const DEFAULT_CHECK_INTERVAL = 1000;

/**
 * Blocks UI based on a dynamic condition that is periodically evaluated.
 *
 * @public
 * @since 0.6.0
 * @see {@link useBlocker} for simple conditional blocking with boolean
 * @see {@link useScheduledBlocker} for time-based blocking
 * @see {@link ConditionalBlockerConfig} for configuration options
 */
export function useConditionalBlocker<TState = unknown>(
  blockerId: string,
  config: ConditionalBlockerConfig<TState>
): void {
  const { addBlocker, removeBlocker } = useResolvedValue((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));
  const intervalRef = useRef<Nullable<ReturnType<typeof setInterval>>>(null);
  const isBlockedRef = useRef(false);
  const configRef = useConfigRef(config);

  const checkInterval =
    !isUndefined(config.checkInterval) && config.checkInterval > 0
      ? config.checkInterval
      : DEFAULT_CHECK_INTERVAL;

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

    intervalRef.current = setInterval(checkCondition, checkInterval);

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
  }, [checkCondition, blockerId, removeBlocker, checkInterval]);
}
