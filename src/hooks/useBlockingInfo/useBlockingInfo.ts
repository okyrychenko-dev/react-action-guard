import { useMemo } from "react";
import { useStore } from "zustand";
import { useResolvedStore } from "../../context";
import { DEFAULT_SCOPE } from "../../store";
import type { BlockerInfo } from "../../store";

/**
 * Hook to get detailed blocking information for a scope
 *
 * Returns an array of blocker information objects for the specified scope,
 * sorted by priority (highest first). Automatically re-renders when blockers change.
 *
 * Uses a stable reference - only re-renders when the actual blocker list changes,
 * not on every store update.
 *
 * Supports both global store and context store (via UIBlockingProvider).
 *
 * @param scope - Scope to get blocking information for (default: "global")
 * @returns Array of blocker information objects, sorted by priority
 *
 * ```
 */
export const useBlockingInfo = (scope: string = DEFAULT_SCOPE): ReadonlyArray<BlockerInfo> => {
  const store = useResolvedStore();

  // Subscribe to the activeBlockers Map to detect changes
  const activeBlockers = useStore(store, (state) => state.activeBlockers);

  // Recompute blockers only when activeBlockers or scope changes
  return useMemo(() => {
    return store.getState().getBlockingInfo(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlockers, scope, store]);
};
