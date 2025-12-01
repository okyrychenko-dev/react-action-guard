import { useMemo } from "react";
import { useStore } from "zustand";
import { DEFAULT_SCOPE } from "../../store";
import { type BlockerInfo, uiBlockingStoreApi } from "../../store";

/**
 * Hook to get detailed blocking information for a scope
 *
 * Returns an array of blocker information objects for the specified scope,
 * sorted by priority (highest first). Automatically re-renders when blockers change.
 *
 * Uses a stable reference - only re-renders when the actual blocker list changes,
 * not on every store update.
 *
 * @param scope - Scope to get blocking information for (default: "global")
 * @returns Array of blocker information objects, sorted by priority
 *
 * ```
 */
export const useBlockingInfo = (scope: string = DEFAULT_SCOPE): ReadonlyArray<BlockerInfo> => {
  // Subscribe to the activeBlockers Map to detect changes
  const activeBlockers = useStore(uiBlockingStoreApi, (state) => state.activeBlockers);

  // Recompute blockers only when activeBlockers or scope changes
  return useMemo(() => {
    return uiBlockingStoreApi.getState().getBlockingInfo(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlockers, scope]);
};
