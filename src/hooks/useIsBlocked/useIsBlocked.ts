import { useResolvedStoreWithSelector } from "../../context";

/**
 * Hook to check if a scope is currently blocked
 *
 * Returns a boolean indicating whether the specified scope(s) are blocked.
 * Automatically re-renders when the blocking state changes.
 *
 * Supports both global store and context store (via UIBlockingProvider).
 *
 * @param scope - Scope or array of scopes to check (default: "global")
 * @returns True if any of the specified scopes are blocked
 *
 */
export const useIsBlocked = (scope?: string | ReadonlyArray<string>): boolean => {
  return useResolvedStoreWithSelector((state) => state.isBlocked(scope));
};
