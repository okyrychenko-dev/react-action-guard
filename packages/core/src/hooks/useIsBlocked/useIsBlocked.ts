import { useResolvedValue } from "../../context";

/**
 * Checks if one or more scopes are currently blocked.
 *
 * @public
 * @since 0.6.0
 * @see {@link useBlocker} to create a blocker
 * @see {@link useBlockingInfo} to get detailed information about active blockers
 */
export function useIsBlocked(scope?: string | ReadonlyArray<string>): boolean {
  return useResolvedValue((state) => state.isBlocked(scope));
}
