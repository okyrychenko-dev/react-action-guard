import { useCallback } from "react";
import { useResolvedValue } from "../../context";
import { ASYNC_ACTION_PRIORITY } from "../../store";
import { useBlockerIdAllocator } from "../useBlockerIdAllocator";

/**
 * Options for useAsyncAction hook
 */
export interface UseAsyncActionOptions {
  /** Timeout in milliseconds after which the blocker will be automatically removed */
  timeout?: number;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}

/**
 * Wraps async functions with UI blocking. Concurrent calls get unique blocker IDs;
 * each blocker is removed on success or failure.
 *
 * @public
 * @since 0.6.0
 * @see {@link useBlocker} for manual blocker management
 * @see {@link useIsBlocked} to check blocking state
 * @see {@link UseAsyncActionOptions} for available options
 */
export function useAsyncAction<T = unknown>(
  actionId: string,
  scope?: string | ReadonlyArray<string>,
  options?: UseAsyncActionOptions
): (asyncFn: () => Promise<T>) => Promise<T> {
  const allocateBlockerId = useBlockerIdAllocator();
  const { addBlocker, removeBlocker } = useResolvedValue((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  const executeWithBlocking = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T> => {
      const blockerId = allocateBlockerId(actionId);

      try {
        addBlocker(blockerId, {
          scope,
          reason: `Executing ${actionId}`,
          priority: ASYNC_ACTION_PRIORITY,
          timeout: options?.timeout,
          onTimeout: options?.onTimeout,
        });

        return await asyncFn();
      } finally {
        removeBlocker(blockerId);
      }
    },
    [
      actionId,
      scope,
      options?.timeout,
      options?.onTimeout,
      allocateBlockerId,
      addBlocker,
      removeBlocker,
    ]
  );

  return executeWithBlocking;
}
