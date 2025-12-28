import { useMemo } from "react";
import { useStore } from "zustand";
import { useResolvedStore } from "../../context";
import { DEFAULT_SCOPE } from "../../store";
import type { BlockerInfo } from "../../store";

/**
 * Gets detailed information about all active blockers for a specific scope.
 * 
 * Returns an array of blocker information objects, sorted by priority (highest first).
 * Each blocker object contains id, reason, priority, and scope information.
 * The hook automatically re-renders when blockers are added, removed, or updated.
 * 
 * Uses memoization to provide a stable reference - only re-renders when the actual
 * blocker list changes, not on every store update. This makes it efficient for
 * rendering lists of blockers.
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @param scope - Scope to get blocking information for. Defaults to "global" if not specified.
 * @returns Array of {@link BlockerInfo} objects, sorted by priority (highest to lowest)
 * 
 * @example
 * Display list of active blockers
 * ```tsx
 * function BlockerList() {
 *   const blockers = useBlockingInfo('form');
 *   
 *   if (blockers.length === 0) {
 *     return <div>No active blockers</div>;
 *   }
 *   
 *   return (
 *     <ul>
 *       {blockers.map((blocker) => (
 *         <li key={blocker.id}>
 *           {blocker.reason} (Priority: {blocker.priority})
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 * 
 * @example
 * Show highest priority blocker reason
 * ```tsx
 * function BlockingBanner() {
 *   const blockers = useBlockingInfo('global');
 *   
 *   // blockers are already sorted by priority (highest first)
 *   const topBlocker = blockers[0];
 *   
 *   if (!topBlocker) {
 *     return null;
 *   }
 *   
 *   return <div className="banner">{topBlocker.reason}</div>;
 * }
 * ```
 * 
 * @example
 * Count active blockers
 * ```tsx
 * function BlockerCount() {
 *   const formBlockers = useBlockingInfo('form');
 *   const navBlockers = useBlockingInfo('navigation');
 *   
 *   const total = formBlockers.length + navBlockers.length;
 *   
 *   return <div>{total} active blockers</div>;
 * }
 * ```
 * 
 * @see {@link useIsBlocked} for a simple boolean check
 * @see {@link useBlocker} to create blockers
 * @see {@link BlockerInfo} for the structure of blocker information objects
 * 
 * @public
 * @since 0.6.0
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
