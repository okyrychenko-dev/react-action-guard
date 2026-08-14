import { isThenable } from "../utils";

/**
 * Result of a confirmation action
 */
export type ConfirmationResult = "confirmed" | "cancelled" | "pending";

/**
 * Callbacks for handling confirmation results
 */
export interface ConfirmationCallbacks {
  /**
   * Called when user confirms the action (synchronous confirmations only).
   * For async confirmations, handle in your own Promise chain.
   */
  onConfirm?: () => void;

  /**
   * Called when user cancels the action (synchronous confirmations only).
   * For async confirmations, handle in your own Promise chain.
   */
  onCancel?: () => void;
}

/**
 * Handles confirmation dialog logic with support for sync/async handlers.
 *
 * This utility centralizes the confirmation logic that was duplicated across
 * all router adapters. It handles:
 * - Custom confirmation handlers (sync or async)
 * - Fallback to window.confirm
 * - Thenable detection and normalization
 * - Callback invocation at appropriate times
 *
 * **Important:** For async confirmations, this function returns 'pending' and
 * does NOT invoke onConfirm/onCancel. The caller must handle the async result
 * in their own Promise chain to perform router-specific actions.
 *
 * @param message - Message to show in confirmation dialog
 * @param customHandler - Optional custom confirmation handler
 * @param callbacks - Callbacks for sync confirm/cancel events
 * @returns 'confirmed', 'cancelled', or 'pending' (for async)
 *
 * @example
 * ```typescript
 * // Synchronous confirmation with window.confirm
 * const result = handleConfirmation('Leave page?', undefined, {
 *   onConfirm: () => console.log('Confirmed'),
 *   onCancel: () => console.log('Cancelled'),
 * });
 * // result is 'confirmed' or 'cancelled'
 * ```
 *
 * @example
 * ```typescript
 * // Async confirmation - handle in Promise chain
 * const result = handleConfirmation('Save changes?', showCustomDialog, {});
 * if (result === 'pending') {
 *   const asyncResult = showCustomDialog('Save changes?');
 *   Promise.resolve(asyncResult).then((confirmed) => {
 *     if (confirmed) {
 *       // Perform router-specific action
 *     }
 *   });
 * }
 * ```
 */
export function handleConfirmation(
  message: string,
  customHandler: ((message: string) => boolean | PromiseLike<boolean>) | undefined,
  callbacks: ConfirmationCallbacks
): ConfirmationResult {
  const { onConfirm, onCancel } = callbacks;

  // Use custom handler if provided, otherwise fallback to window.confirm
  if (customHandler) {
    const result = customHandler(message);

    // Handle thenable (Promise-like) results
    if (isThenable(result)) {
      // Async: return pending, caller handles the Promise
      return "pending";
    }

    // Sync: immediate result
    if (result) {
      onConfirm?.();
      return "confirmed";
    } else {
      onCancel?.();
      return "cancelled";
    }
  }

  // Default window.confirm (always synchronous)
  const confirmed = window.confirm(message);
  if (confirmed) {
    onConfirm?.();
    return "confirmed";
  } else {
    onCancel?.();
    return "cancelled";
  }
}
