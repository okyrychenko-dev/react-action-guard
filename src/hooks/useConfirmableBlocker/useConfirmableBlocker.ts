import { useCallback, useState } from "react";
import { useBlocker } from "../useBlocker";
import {
  ConfirmableBlockerConfig,
  UseConfirmableBlockerReturn,
} from "./useConfirmableBlocker.types";

/**
 * Creates a blocker that requires user confirmation before executing an action.
 * 
 * Manages a confirmation dialog and blocking state for actions that need user approval.
 * The blocker is active during both the confirmation dialog display and action execution.
 * 
 * Workflow:
 * 1. Call `execute()` to show confirmation dialog (blocker activated)
 * 2. User confirms → `onConfirm` callback runs (blocker remains active)
 * 3. Action completes → blocker removed
 * 4. User cancels → blocker removed, optional `onCancel` callback runs
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @param blockerId - Unique identifier for this confirmable blocker
 * @param config - Configuration for the confirmable action
 * @param config.confirmMessage - Message to display in the confirmation dialog
 * @param config.confirmTitle - Optional dialog title (defaults to "Confirm Action")
 * @param config.confirmButtonText - Optional confirm button text (defaults to "Confirm")
 * @param config.cancelButtonText - Optional cancel button text (defaults to "Cancel")
 * @param config.onConfirm - Async function to execute after user confirms
 * @param config.onCancel - Optional callback when user cancels
 * @param config.scope - Scope(s) to block during confirmation and execution
 * @param config.reason - Optional custom blocking reason (defaults to confirmMessage)
 * @param config.priority - Optional blocker priority (0-100)
 * 
 * @returns Object containing:
 * - `execute`: Function to trigger the confirmation dialog
 * - `isDialogOpen`: Boolean indicating if confirmation dialog is visible
 * - `isExecuting`: Boolean indicating if the confirmed action is executing
 * - `confirmConfig`: Dialog configuration (title, message, button texts)
 * - `onConfirm`: Function to call when user confirms
 * - `onCancel`: Function to call when user cancels
 * 
 * @example
 * Delete confirmation with custom dialog
 * ```tsx
 * function DeleteButton({ itemId, itemName }) {
 *   const confirmableDelete = useConfirmableBlocker('delete-item', {
 *     confirmMessage: `Are you sure you want to delete "${itemName}"?`,
 *     confirmTitle: 'Delete Item',
 *     confirmButtonText: 'Delete',
 *     cancelButtonText: 'Keep',
 *     scope: ['form', 'navigation'],
 *     priority: 80,
 *     onConfirm: async () => {
 *       await deleteItem(itemId);
 *       showToast('Item deleted successfully');
 *     },
 *     onCancel: () => {
 *       console.log('Delete cancelled');
 *     }
 *   });
 *   
 *   return (
 *     <>
 *       <button onClick={confirmableDelete.execute}>
 *         Delete
 *       </button>
 *       
 *       {confirmableDelete.isDialogOpen && (
 *         <ConfirmDialog
 *           {...confirmableDelete.confirmConfig}
 *           onConfirm={confirmableDelete.onConfirm}
 *           onCancel={confirmableDelete.onCancel}
 *           isLoading={confirmableDelete.isExecuting}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @example
 * Simple confirmation with default dialog
 * ```tsx
 * function LogoutButton() {
 *   const confirmLogout = useConfirmableBlocker('logout', {
 *     confirmMessage: 'Are you sure you want to log out?',
 *     scope: 'global',
 *     onConfirm: async () => {
 *       await api.logout();
 *       navigate('/login');
 *     }
 *   });
 *   
 *   return (
 *     <>
 *       <button onClick={confirmLogout.execute}>Logout</button>
 *       
 *       {confirmLogout.isDialogOpen && (
 *         <Dialog
 *           title={confirmLogout.confirmConfig.title}
 *           message={confirmLogout.confirmConfig.message}
 *           onConfirm={confirmLogout.onConfirm}
 *           onCancel={confirmLogout.onCancel}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @example
 * With loading state during execution
 * ```tsx
 * function SaveButton() {
 *   const confirmSave = useConfirmableBlocker('save-changes', {
 *     confirmMessage: 'Save all changes?',
 *     scope: 'form',
 *     onConfirm: async () => {
 *       await saveAllChanges();
 *     }
 *   });
 *   
 *   return (
 *     <button 
 *       onClick={confirmSave.execute}
 *       disabled={confirmSave.isExecuting}
 *     >
 *       {confirmSave.isExecuting ? 'Saving...' : 'Save All'}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @see {@link useBlocker} for simple blocking without confirmation
 * @see {@link ConfirmableBlockerConfig} for configuration options
 * @see {@link UseConfirmableBlockerReturn} for return value structure
 * 
 * @public
 * @since 0.6.0
 */
export const useConfirmableBlocker = (
  blockerId: string,
  config: ConfirmableBlockerConfig
): UseConfirmableBlockerReturn => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useBlocker(
    blockerId,
    {
      ...config,
      reason: config.reason ?? config.confirmMessage,
    },
    isDialogOpen || isExecuting
  );

  const execute = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const onConfirm = useCallback(async () => {
    setIsDialogOpen(false);
    setIsExecuting(true);

    try {
      await config.onConfirm();
    } catch (error) {
      console.error("[UIBlocking] Confirmable action error:", error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [config]);

  const onCancel = useCallback(() => {
    setIsDialogOpen(false);
    config.onCancel?.();
  }, [config]);

  return {
    execute,
    isDialogOpen,
    isExecuting,
    confirmConfig: {
      title: config.confirmTitle ?? "Confirm Action",
      message: config.confirmMessage,
      confirmText: config.confirmButtonText ?? "Confirm",
      cancelText: config.cancelButtonText ?? "Cancel",
    },
    onConfirm,
    onCancel,
  };
};
