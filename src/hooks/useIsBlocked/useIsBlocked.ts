import { useResolvedStoreWithSelector } from "../../context";

/**
 * Checks if one or more scopes are currently blocked.
 * 
 * Returns a boolean indicating whether any of the specified scopes have active blockers.
 * The hook automatically re-renders the component when the blocking state changes,
 * ensuring your UI always reflects the current blocking state.
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @param scope - Scope(s) to check for blocking. Can be:
 *                - A single scope string (e.g., "form", "navigation", "global")
 *                - An array of scopes (e.g., ["form", "navigation"])
 *                - undefined to check the "global" scope
 * @returns true if ANY of the specified scopes are blocked, false otherwise
 * 
 * @example
 * Basic single scope check
 * ```tsx
 * function SubmitButton() {
 *   const isFormBlocked = useIsBlocked('form');
 *   
 *   return (
 *     <button disabled={isFormBlocked}>
 *       {isFormBlocked ? 'Processing...' : 'Submit'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @example
 * Multiple scopes check
 * ```tsx
 * function NavigationLink({ href, children }) {
 *   const isBlocked = useIsBlocked(['navigation', 'global']);
 *   
 *   return (
 *     <a
 *       href={href}
 *       onClick={(e) => {
 *         if (isBlocked) {
 *           e.preventDefault();
 *           alert('Navigation is currently blocked');
 *         }
 *       }}
 *       style={{ opacity: isBlocked ? 0.5 : 1 }}
 *     >
 *       {children}
 *     </a>
 *   );
 * }
 * ```
 * 
 * @example
 * Conditional rendering based on blocking state
 * ```tsx
 * function SaveIndicator() {
 *   const isSaving = useIsBlocked('save');
 *   
 *   if (!isSaving) {
 *     return null;
 *   }
 *   
 *   return <div className="spinner">Saving...</div>;
 * }
 * ```
 * 
 * @see {@link useBlocker} to create a blocker
 * @see {@link useBlockingInfo} to get detailed information about active blockers
 * 
 * @public
 * @since 0.6.0
 */
export const useIsBlocked = (scope?: string | ReadonlyArray<string>): boolean => {
  return useResolvedStoreWithSelector((state) => state.isBlocked(scope));
};
