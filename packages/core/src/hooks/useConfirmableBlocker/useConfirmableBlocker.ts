import { useCallback, useState } from "react";
import { useActionBlocker } from "../useActionBlocker";
import {
  ConfirmableBlockerConfig,
  UseConfirmableBlockerReturn,
} from "./useConfirmableBlocker.types";

/**
 * Creates a blocker that requires user confirmation before executing an action.
 *
 * @public
 * @since 0.6.0
 * @see {@link useActionBlocker} for simple blocking without confirmation
 * @see {@link ConfirmableBlockerConfig} for configuration options
 * @see {@link UseConfirmableBlockerReturn} for return value structure
 */
export function useConfirmableBlocker(
  blockerId: string,
  config: ConfirmableBlockerConfig
): UseConfirmableBlockerReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useActionBlocker(
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
}
