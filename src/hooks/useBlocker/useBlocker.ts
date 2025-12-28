import { useEffect } from "react";
import { useResolvedStoreWithSelector } from "../../context";
import type { BlockerConfig } from "../../store";

/**
 * Automatically manages a UI blocker based on component lifecycle.
 * 
 * Creates a blocker that is automatically added when the condition is true
 * and removed when the component unmounts or condition becomes false.
 * Supports scoped blocking, priorities, timeouts, and works with both
 * global store and isolated provider instances.
 * 
 * @param blockerId - Unique identifier for this blocker. Must be unique within the scope.
 * @param config - Configuration object for the blocker
 * @param config.scope - Scope(s) to block. Can be a single scope string (e.g., "form", "navigation")
 *                       or an array of scopes (e.g., ["form", "navigation"]). Defaults to "global".
 * @param config.reason - Human-readable reason for blocking, displayed in DevTools and UI
 * @param config.priority - Priority level (0-100). Higher priority blockers take precedence.
 *                          Use 0-30 for low priority, 31-70 for medium, 71-100 for high priority.
 * @param config.timeout - Auto-removal timeout in milliseconds. Blocker will be automatically
 *                         removed after this duration. Use 0 or undefined for no timeout.
 * @param config.onTimeout - Callback function invoked when the blocker times out
 * @param isActive - When true, blocker is active; when false, blocker is removed.
 *                   Defaults to true. Use this for conditional blocking.
 * 
 * @example
 * Basic form submission blocking
 * ```tsx
 * function MyForm() {
 *   const [isSubmitting, setIsSubmitting] = useState(false);
 *   
 *   useBlocker('form-submit', {
 *     scope: 'form',
 *     reason: 'Submitting form...',
 *     priority: 50,
 *     timeout: 30000, // Auto-remove after 30 seconds
 *     onTimeout: () => {
 *       console.warn('Form submission timed out');
 *       setIsSubmitting(false);
 *     }
 *   }, isSubmitting);
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 * 
 * @example
 * Multiple scopes with high priority
 * ```tsx
 * useBlocker('critical-save', {
 *   scope: ['form', 'navigation', 'actions'],
 *   reason: 'Saving critical data...',
 *   priority: 90,
 * }, isSaving);
 * ```
 * 
 * @example
 * Conditional blocking based on unsaved changes
 * ```tsx
 * function Editor() {
 *   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 *   
 *   useBlocker('unsaved-changes', {
 *     scope: 'navigation',
 *     reason: 'You have unsaved changes',
 *     priority: 80,
 *   }, hasUnsavedChanges);
 *   
 *   return <div>...</div>;
 * }
 * ```
 * 
 * @see {@link useIsBlocked} to check if a scope is currently blocked
 * @see {@link useBlockingInfo} to get detailed blocker information
 * @see {@link useAsyncAction} for async operation wrapping with automatic blocking
 * @see {@link useConfirmableBlocker} for blockers that require user confirmation
 * 
 * @public
 * @since 0.6.0
 */
export const useBlocker = (blockerId: string, config: BlockerConfig, isActive = true): void => {
  const { addBlocker, removeBlocker } = useResolvedStoreWithSelector((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  useEffect(() => {
    if (!isActive || !blockerId) {
      return;
    }

    addBlocker(blockerId, config);

    return () => {
      removeBlocker(blockerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockerId, isActive, addBlocker, removeBlocker]);
};
