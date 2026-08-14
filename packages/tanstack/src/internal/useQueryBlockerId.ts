import { type QueryKey, hashKey } from "@tanstack/react-query";
import { useId, useMemo } from "react";

/**
 * Generates a blocker ID scoped to both query key and hook instance.
 * Uses TanStack Query's hashKey for stable key fingerprint and useId for per-instance isolation.
 *
 * @param prefix - Prefix for the blocker ID (e.g., "query", "mutation")
 * @param queryKey - TanStack Query key to serialize
 * @returns Memoized blocker ID
 */
export function useQueryBlockerId(prefix: string, queryKey: QueryKey): string {
  const instanceId = useId();
  return useMemo(
    () => `${prefix}-${hashKey(queryKey)}-${instanceId}`,
    [prefix, queryKey, instanceId]
  );
}
