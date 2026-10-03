import { useCallback, useEffect, useRef, useState } from "react";
import type { Nullable } from "@okyrychenko-dev/type-utils";

/**
 * State object for a confirmation dialog
 */
export interface DialogState<T = string> {
  /** Whether the dialog is currently open */
  isOpen: boolean;

  /** The data to display in the dialog (typically a message) */
  message: T;

  /** Settle and close this dialog; repeated or stale calls have no effect */
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
   * Resolves true on confirmation, false on cancellation, replacement or unmount.
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      resolveRef.current?.(false);
    };
  }, []);

  const confirm = useCallback((message: T): Promise<boolean> => {
    if (!mountedRef.current) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      if (resolveRef.current) {
        resolveRef.current(false);
      }

      const settle = (confirmed: boolean): void => {
        if (resolveRef.current !== settle) {
          return;
        }

        resolveRef.current = null;
        resolve(confirmed);

        if (mountedRef.current) {
          setDialogState(null);
        }
      };

      resolveRef.current = settle;

      setDialogState({
        isOpen: true,
        message,
        resolve: settle,
      });
    });
  }, []);

  const closeDialog = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed);
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
