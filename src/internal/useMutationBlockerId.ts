import { hashKey } from "@tanstack/react-query";
import { useId, useMemo } from "react";

/**
 * Generates a blocker ID for mutations scoped to hook instance.
 * Uses TanStack Query's hashKey when mutationKey is provided and always appends useId
 * to avoid collisions between multiple mounted hook instances.
 *
 * @param prefix - Prefix for the blocker ID (default: "mutation")
 * @param mutationKey - Optional mutation key for deterministic IDs
 * @returns Memoized blocker ID
 */
export function useMutationBlockerId(
  prefix = "mutation",
  mutationKey?: ReadonlyArray<unknown>
): string {
  const instanceId = useId();
  return useMemo(
    () =>
      mutationKey ? `${prefix}-${hashKey(mutationKey)}-${instanceId}` : `${prefix}-${instanceId}`,
    [prefix, mutationKey, instanceId]
  );
}
