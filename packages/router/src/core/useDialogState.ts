import { useCallback, useRef, useState } from "react";
import type { Nullable } from "@okyrychenko-dev/type-utils";

/**
 * State object for a confirmation dialog
 */
export interface DialogState<T = string> {
  /** Whether the dialog is currently open */
  isOpen: boolean;

  /** The data to display in the dialog (typically a message) */
  message: T;

  /** Resolver function to confirm/cancel navigation */
  resolve: (confirmed: boolean) => void;
}

/**
 * Return type for useDialogState hook
 */
export interface UseDialogStateReturn<T = string> {
  /** Current dialog state (null when closed) */
  dialogState: Nullable<DialogState<T>>;

  /**
   * Function to use as onConfirm callback.
   * Returns a Promise that resolves when user confirms/cancels.
   */
  confirm: (message: T) => Promise<boolean>;

  /** Close dialog with confirmation (allows navigation) */
  onConfirm: () => void;

  /** Close dialog with cancellation (blocks navigation) */
  onCancel: () => void;
}

/**
 * Hook to manage custom confirmation dialog state.
 */
export function useDialogState<T = string>(): UseDialogStateReturn<T> {
  const [dialogState, setDialogState] = useState<Nullable<DialogState<T>>>(null);
  const resolveRef = useRef<Nullable<DialogState<T>["resolve"]>>(null);

  const confirm = useCallback((message: T): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (resolveRef.current) {
        resolveRef.current(false);
      }
      resolveRef.current = resolve;
      setDialogState({
        isOpen: true,
        message,
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;

    if (resolve) {
      resolve(confirmed);
    }
    resolveRef.current = null;
    setDialogState(null);
  }, []);

  const onConfirm = useCallback(() => {
    closeDialog(true);
  }, [closeDialog]);

  const onCancel = useCallback(() => {
    closeDialog(false);
  }, [closeDialog]);

  return {
    dialogState,
    confirm,
    onConfirm,
    onCancel,
  };
}
