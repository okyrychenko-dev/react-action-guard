import { isThenable } from "../utils";
import type { Optional } from "@okyrychenko-dev/type-utils";

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
 */
export function handleConfirmation(
  message: string,
  customHandler: Optional<(message: string) => boolean | PromiseLike<boolean>>,
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
