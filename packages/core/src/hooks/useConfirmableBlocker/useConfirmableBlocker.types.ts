import type { BlockerConfig } from "../../store";

/**
 * Configuration for the confirmation dialog
 */
export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

/**
 * Configuration for confirmable blocker hook.
 *
 * The reason property can be used to provide a different blocking reason
 * than the confirmMessage. If not provided, confirmMessage will be used as the reason.
 */
export interface ConfirmableBlockerConfig extends BlockerConfig {
  /** Message to display in the confirmation dialog */
  confirmMessage: string;
  /** Title for the confirmation dialog (default: "Confirm Action") */
  confirmTitle?: string;
  /** Text for the confirm button (default: "Confirm") */
  confirmButtonText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelButtonText?: string;
  /** Callback to execute when confirmed. Can be async. */
  onConfirm: () => void | Promise<void>;
  /** Optional callback to execute when cancelled */
  onCancel?: VoidFunction;
}

/**
 * Return type for useConfirmableBlocker hook
 */
export interface UseConfirmableBlockerReturn {
  execute: VoidFunction;
  isDialogOpen: boolean;
  isExecuting: boolean;
  confirmConfig: ConfirmDialogConfig;
  onConfirm: () => Promise<void>;
  onCancel: VoidFunction;
}
