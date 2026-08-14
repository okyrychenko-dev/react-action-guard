import { useCallback, useRef, useState } from "react";

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
  dialogState: DialogState<T> | null;

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
 *
 * Simplifies integration with custom dialog components when using
 * navigation blocking with `onConfirm` callback.
 *
 * @template T - Type of message/data to pass to dialog (defaults to string)
 * @returns Object with dialog state and control functions
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const [isDirty, setIsDirty] = useState(false);
 *   const { dialogState, confirm, onConfirm, onCancel } = useDialogState();
 *
 *   useNavigationBlocker({
 *     when: isDirty,
 *     message: 'Unsaved changes',
 *     onConfirm: confirm,
 *   });
 *
 *   return (
 *     <>
 *       <form>...</form>
 *       {dialogState && (
 *         <ConfirmDialog
 *           message={dialogState.message}
 *           onConfirm={onConfirm}
 *           onCancel={onCancel}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With Material-UI
 * import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
 *
 * function EditPage() {
 *   const { dialogState, confirm, onConfirm, onCancel } = useDialogState();
 *
 *   useNavigationBlocker({
 *     when: hasChanges,
 *     onConfirm: confirm,
 *   });
 *
 *   return (
 *     <Dialog open={dialogState?.isOpen ?? false}>
 *       <DialogTitle>{dialogState?.message}</DialogTitle>
 *       <DialogActions>
 *         <Button onClick={onCancel}>Stay</Button>
 *         <Button onClick={onConfirm}>Leave</Button>
 *       </DialogActions>
 *     </Dialog>
 *   );
 * }
 * ```
 */
export function useDialogState<T = string>(): UseDialogStateReturn<T> {
  const [dialogState, setDialogState] = useState<DialogState<T> | null>(null);
  const resolveRef = useRef<DialogState<T>["resolve"] | null>(null);

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
