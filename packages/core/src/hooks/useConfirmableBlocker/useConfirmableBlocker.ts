import { useCallback, useRef, useState } from "react";
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
  const executionRef = useRef<Promise<void> | null>(null);

  useActionBlocker(
    blockerId,
    {
      ...config,
      reason: config.reason ?? config.confirmMessage,
    },
    isDialogOpen || isExecuting
  );

  const execute = useCallback(() => {
    if (executionRef.current) {
      return;
    }

    setIsDialogOpen(true);
  }, []);

  const onConfirm = useCallback(async () => {
    if (executionRef.current) {
      return executionRef.current;
    }

    setIsDialogOpen(false);
    setIsExecuting(true);

    async function runConfirmation(): Promise<void> {
      try {
        await config.onConfirm();
      } finally {
        executionRef.current = null;
        setIsExecuting(false);
      }
    }

    // Publish ownership before invoking user code, including reentrant callbacks.
    const execution = Promise.resolve().then(runConfirmation);

    executionRef.current = execution;

    return execution;
  }, [config]);

  const onCancel = useCallback(() => {
    if (executionRef.current) {
      return;
    }

    setIsDialogOpen(false);
    config.onCancel?.();
  }, [config]);

  const { confirmTitle, confirmMessage, confirmButtonText, cancelButtonText } = config;

  const confirmConfig = {
    title: confirmTitle ?? "Confirm Action",
    message: confirmMessage,
    confirmText: confirmButtonText ?? "Confirm",
    cancelText: cancelButtonText ?? "Cancel",
  };

  return {
    execute,
    isDialogOpen,
    isExecuting,
    confirmConfig,
    onConfirm,
    onCancel,
  };
}
