import { useCallback } from "react";
import { useResolvedValue } from "../../context";
import { ASYNC_ACTION_PRIORITY } from "../../store";
import { useBlockerIdAllocator } from "../useBlockerIdAllocator";
import type { UseAsyncActionReturn } from "./useAsyncAction.types";

/**
 * Options for useAsyncAction hook
 */
export interface UseAsyncActionOptions {
  /** Human-readable reason; defaults to `Executing ${actionId}` */
  reason?: string;
  /** Reason ordering priority (minimum 0); defaults to ASYNC_ACTION_PRIORITY (20) */
  priority?: number;
  /** Blocker lifetime in milliseconds; does not cancel or settle the operation */
  timeout?: number;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}

/**
 * Wraps async functions with UI blocking. Concurrent calls get unique blocker IDs;
 * each blocker is removed in finally on success or failure, even after caller unmount.
 * Tracking does not exclude concurrent execution. Timeout releases only the blocker.
 *
 * @public
 * @since 0.6.0
 * @see {@link useActionBlocker} for manual blocker management
 * @see {@link useIsBlocked} to check blocking state
 * @see {@link UseAsyncActionOptions} for available options
 */
export function useAsyncAction<T = unknown>(
  actionId: string,
  scope?: string | ReadonlyArray<string>,
  options?: UseAsyncActionOptions
): UseAsyncActionReturn<T> {
  const {
    reason = `Executing ${actionId}`,
    priority = ASYNC_ACTION_PRIORITY,
    timeout,
    onTimeout,
  } = options ?? {};

  const allocateBlockerId = useBlockerIdAllocator();
  const { addBlocker, removeBlocker } = useResolvedValue((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  const executeWithBlocking = useCallback(
    async <TResult extends T>(asyncFn: () => Promise<TResult>): Promise<TResult> => {
      const blockerId = allocateBlockerId(actionId);

      try {
        addBlocker(blockerId, {
          scope,
          reason,
          priority,
          timeout,
          onTimeout,
        });

        return await asyncFn();
      } finally {
        removeBlocker(blockerId);
      }
    },
    [
      actionId,
      scope,
      reason,
      priority,
      timeout,
      onTimeout,
      allocateBlockerId,
      addBlocker,
      removeBlocker,
    ]
  );

  return executeWithBlocking;
}
