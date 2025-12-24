import { useCallback, useRef } from "react";
import { useResolvedStoreWithSelector } from "../../context";
import { ASYNC_ACTION_PRIORITY } from "../../store";

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
 * Hook to wrap async functions with automatic blocking/unblocking
 *
 * Creates a wrapper function that automatically adds a blocker before executing
 * the async function and removes it after completion (success or failure).
 *
 * Supports both global store and context store (via UIBlockingProvider).
 *
 * @template T - The return type of the async function
 * @param actionId - Unique identifier for the action (used in blocker ID and reason)
 * @param scope - Scope(s) to block during execution (default: "global")
 * @param options - Optional configuration including timeout
 * @returns Function that wraps async functions with blocking behavior
 *
 */
export const useAsyncAction = <T = unknown>(
  actionId: string,
  scope?: string | ReadonlyArray<string>,
  options?: UseAsyncActionOptions
): ((asyncFn: () => Promise<T>) => Promise<T>) => {
  const { addBlocker, removeBlocker } = useResolvedStoreWithSelector((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  // Use counter instead of Date.now() to guarantee unique IDs even for rapid calls
  const counterRef = useRef(0);

  const executeWithBlocking = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T> => {
      counterRef.current += 1;
      const blockerId = `${actionId}-${String(counterRef.current)}`;

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
    [actionId, scope, options?.timeout, options?.onTimeout, addBlocker, removeBlocker]
  );

  return executeWithBlocking;
};
