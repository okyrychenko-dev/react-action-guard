import { useMemo } from "react";
import { useStore } from "zustand";
import { useResolvedStoreApi } from "../../context";
import { DEFAULT_SCOPE } from "../../store";
import type { BlockerInfo } from "../../store";

/**
 * Gets detailed information about all active blockers for a specific scope.
 *
 * @public
 * @since 0.6.0
 * @see {@link useIsBlocked} for a simple boolean check
 * @see {@link useBlocker} to create blockers
 * @see {@link BlockerInfo} for the structure of blocker information objects
 */
export function useBlockingInfo(
  scope: string = DEFAULT_SCOPE
): ReadonlyArray<Readonly<BlockerInfo>> {
  const store = useResolvedStoreApi();

  const blockingSnapshot = useStore(store, (state) => state.blockingSnapshot);

  // Recompute only when the immutable lifecycle projection or scope changes
  return useMemo(() => {
    return store.getState().getBlockingInfo(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockingSnapshot, scope, store]);
}
