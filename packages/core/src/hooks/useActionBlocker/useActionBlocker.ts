import { useEffect } from "react";
import { useBlockerRegistration } from "./useBlockerRegistration";
import type { BlockerConfig } from "../../store";

/**
 * Automatically manages a UI blocker based on component lifecycle.
 *
 * @public
 * @since 0.6.0
 * @see {@link useIsBlocked} to check if a scope is currently blocked
 * @see {@link useBlockingInfo} to get detailed blocker information
 * @see {@link useAsyncAction} for async operation wrapping with automatic blocking
 * @see {@link useConfirmableBlocker} for blockers that require user confirmation
 */
export function useActionBlocker(blockerId: string, config: BlockerConfig, isActive = true): void {
  const { activate, deactivate } = useBlockerRegistration({ blockerId, config });

  useEffect(() => {
    if (!isActive) {
      return;
    }
    activate();

    return deactivate;
  }, [isActive, activate, deactivate]);
}

/**
 * @deprecated Use {@link useActionBlocker} to avoid confusion with React Router's `useBlocker`.
 */
export const useBlocker: typeof useActionBlocker = useActionBlocker;
