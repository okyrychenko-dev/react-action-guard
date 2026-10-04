import { type Nullable, isNull } from "@okyrychenko-dev/type-utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolvedValue } from "../../context";
import { areBlockerConfigsEqual } from "./useActionBlocker.utils";
import type { BlockerConfig } from "../../store";

/**
 * Automatically manages a UI blocker based on component lifecycle.
 *
 * @public
 * @since 0.6.0
 * @see {@link useIsBlocked} to check if a scope is currently blocked
 * @see {@link useBlockingInfo} to get detailed blocker information
 * @see {@link useAsyncAction} for async operation wrapping with automatic blocking
 * @see {@link useConfirmableBlocker} for blockers that require user confirmation
 */
export function useActionBlocker(blockerId: string, config: BlockerConfig, isActive = true): void {
  const { addBlocker, removeBlocker, replaceBlocker } = useResolvedValue((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
    replaceBlocker: state.replaceBlocker,
  }));
  const lastConfigRef = useRef<Nullable<BlockerConfig>>(null);
  const onTimeoutRef = useRef(config.onTimeout);

  useEffect(() => {
    onTimeoutRef.current = config.onTimeout;
  }, [config.onTimeout]);

  const handleTimeout = useCallback((id: string): void => {
    onTimeoutRef.current?.(id);
  }, []);

  const storeConfig = useMemo<BlockerConfig>(
    () => ({
      ...config,
      onTimeout: config.onTimeout ? handleTimeout : undefined,
    }),
    [config, handleTimeout]
  );

  useEffect(() => {
    if (!isActive || !blockerId) {
      return;
    }

    addBlocker(blockerId, storeConfig);
    lastConfigRef.current = storeConfig;

    return () => {
      lastConfigRef.current = null;
      removeBlocker(blockerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockerId, isActive, addBlocker, removeBlocker]);

  useEffect(() => {
    if (!isActive || !blockerId) {
      return;
    }

    if (
      !isNull(lastConfigRef.current) &&
      areBlockerConfigsEqual(lastConfigRef.current, storeConfig)
    ) {
      return;
    }

    replaceBlocker(blockerId, storeConfig);
    lastConfigRef.current = storeConfig;
  }, [blockerId, storeConfig, isActive, replaceBlocker]);
}

/**
 * @deprecated Use {@link useActionBlocker} to avoid confusion with React Router's `useBlocker`.
 */
export const useBlocker: typeof useActionBlocker = useActionBlocker;
