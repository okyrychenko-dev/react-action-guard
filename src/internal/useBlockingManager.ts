import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useRef } from "react";
import { UseBlockingManagerOptions } from "./useBlockingManager.types";

/**
 * Manages blocker lifecycle (add/remove) with automatic cleanup.
 * Centralizes the common blocker management logic used across all blocking hooks.
 *
 * This hook handles:
 * - Adding/removing blockers based on shouldBlock condition
 * - Automatic cleanup on unmount
 * - Dependency tracking for re-evaluation
 *
 * @param options - Configuration for blocker management
 */
export function useBlockingManager({
  blockerId,
  shouldBlock,
  scope,
  reason,
  priority,
  timeout,
  onTimeout,
}: UseBlockingManagerOptions): void {
  const { addBlocker, updateBlocker, removeBlocker } = uiBlockingStoreApi.getState();

  // Track whether this hook instance currently owns an active blocker.
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    return () => {
      if (isRegisteredRef.current) {
        removeBlocker(blockerId);
        isRegisteredRef.current = false;
      }
    };
  }, [blockerId, removeBlocker]);

  useEffect(() => {
    const blockerConfig = { scope, reason, priority, timeout, onTimeout };

    if (shouldBlock) {
      if (isRegisteredRef.current) {
        updateBlocker(blockerId, blockerConfig);
      } else {
        addBlocker(blockerId, blockerConfig);
        isRegisteredRef.current = true;
      }
    } else if (isRegisteredRef.current) {
      removeBlocker(blockerId);
      isRegisteredRef.current = false;
    }
  }, [
    addBlocker,
    updateBlocker,
    blockerId,
    priority,
    reason,
    removeBlocker,
    scope,
    shouldBlock,
    timeout,
    onTimeout,
  ]);
}
