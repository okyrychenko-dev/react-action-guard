import { isUndefined } from "@okyrychenko-dev/type-utils";
import { useCallback, useEffect, useRef } from "react";
import { useBlockerRegistration } from "../useActionBlocker";
import { useConfigRef } from "../useConfigRef";
import { ConditionalBlockerConfig } from "./useConditionalBlocker.types";

const DEFAULT_CHECK_INTERVAL = 1000;

/**
 * Blocks UI based on a dynamic condition that is periodically evaluated.
 *
 * @public
 * @since 0.6.0
 * @see {@link useActionBlocker} for simple conditional blocking with boolean
 * @see {@link useScheduledBlocker} for time-based blocking
 * @see {@link ConditionalBlockerConfig} for configuration options
 */
export function useConditionalBlocker<TState = unknown>(
  blockerId: string,
  config: ConditionalBlockerConfig<TState>
): void {
  const { activate, deactivate } = useBlockerRegistration({
    blockerId,
    config,
    endEpisodeOnTimeout: true,
  });
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
      activate();
    } else {
      deactivate();
    }
    isBlockedRef.current = shouldBlock;
  }, [activate, deactivate, configRef]);

  useEffect(
    () => () => {
      deactivate();
      isBlockedRef.current = false;
    },
    [deactivate]
  );

  useEffect(() => {
    checkCondition();

    const interval = setInterval(checkCondition, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [checkCondition, checkInterval]);
}
