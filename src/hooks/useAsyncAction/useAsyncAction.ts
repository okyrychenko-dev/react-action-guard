import { useCallback } from "react";
import { ASYNC_ACTION_PRIORITY, useUIBlockingStore } from "../../store";

/**
 * Hook to wrap async functions with automatic blocking/unblocking
 *
 * Creates a wrapper function that automatically adds a blocker before executing
 * the async function and removes it after completion (success or failure).
 *
 * @template T - The return type of the async function
 * @param actionId - Unique identifier for the action (used in blocker ID and reason)
 * @param scope - Scope(s) to block during execution (default: "global")
 * @returns Function that wraps async functions with blocking behavior
 *
 */
export const useAsyncAction = <T = unknown>(
  actionId: string,
  scope?: string | ReadonlyArray<string>
): ((asyncFn: () => Promise<T>) => Promise<T>) => {
  const { addBlocker, removeBlocker } = useUIBlockingStore();

  const executeWithBlocking = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T> => {
      const blockerId = `${actionId}-${Date.now().toString()}`;

      try {
        addBlocker(blockerId, {
          scope,
          reason: `Executing ${actionId}`,
          priority: ASYNC_ACTION_PRIORITY,
        });

        return await asyncFn();
      } finally {
        removeBlocker(blockerId);
      }
    },
    [actionId, scope, addBlocker, removeBlocker]
  );

  return executeWithBlocking;
};
