import { useCallback, useState } from "react";
import { useBlocker } from "../useBlocker";
import {
  ConfirmableBlockerConfig,
  UseConfirmableBlockerReturn,
} from "./useConfirmableBlocker.types";

/**
 * Hook for creating a confirmable action with blocking UI
 *
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
