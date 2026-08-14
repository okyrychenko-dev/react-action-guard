import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  DEFAULT_UNLOAD_MESSAGE,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { NavigationBlockerReturn } from "../core/types";
import type { SafeTanStackRouter, UseNavigationBlockerOptions } from "./types";

interface RetryableUpdate {
  [key: string]: unknown;
  retry: () => void;
}

const hasBlockingHistory = (value: unknown): value is SafeTanStackRouter => {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!("history" in value)) {
    return false;
  }
  const history = value.history;
  if (!history || typeof history !== "object") {
    return false;
  }
  if (!("block" in history)) {
    return false;
  }
  return typeof history.block === "function";
};

const hasRetry = (value: Record<string, unknown>): value is RetryableUpdate =>
  typeof value.retry === "function";

const attemptRetry = (update: Record<string, unknown>): void => {
  if (hasRetry(update)) {
    try {
      update.retry();
    } catch {
      // Swallow retry errors to avoid breaking blocking flow.
    }
  }
};

/**
 * Blocks navigation in TanStack Router applications based on conditions or scope state.
 *
 * This hook integrates with TanStack Router's history blocking mechanism and
 * react-action-guard's scope system to prevent navigation when certain conditions
 * are met or when specific scopes are blocked.
 *
 * **Features:**
 * - Block navigation based on boolean condition or function
 * - Automatically block when react-action-guard scopes are active
 * - Support for browser `beforeunload` event (tab close/refresh)
 * - Customizable confirmation dialog
 * - Callbacks for block/allow events
 *
 * @param options - Configuration options
 * @returns Object with `isBlocking` state
 *
 * @example
 * ```tsx
 * // Block based on scope
 * function EditForm() {
 *   useNavigationBlocker({
 *     scope: 'form',
 *     message: 'You have unsaved changes. Leave anyway?',
 *   });
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Block based on condition
 * function UnsavedChanges() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useNavigationBlocker({
 *     when: hasChanges,
 *     message: 'Discard changes?',
 *     onBlock: () => console.log('Navigation blocked'),
 *   });
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Type-safe with scopes
 * import { createTypedHooks } from '@okyrychenko-dev/react-action-guard';
 *
 * type AppScopes = 'global' | 'form' | 'checkout';
 * const { useBlocker } = createTypedHooks<AppScopes>();
 *
 * function MyComponent() {
 *   useBlocker('blocker-id', { scope: 'form' });
 *
 *   useNavigationBlocker({
 *     scope: 'form', // Type-safe!
 *     message: 'Leave?',
 *   });
 * }
 * ```
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, onBlock, onAllow, blockBrowserUnload = true, onConfirm } = options;

  const router = useRouter();

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when, scope);

  // Block navigation using TanStack Router's history
  useEffect(() => {
    if (!shouldBlock || !hasBlockingHistory(router)) {
      return;
    }

    // Block navigation with properly typed update parameter
    type NavigationUpdate = Record<string, unknown> & { retry?: () => void };
    const unblock = router.history.block((update: NavigationUpdate) => {
      // Early return if no message
      if (!message) {
        return;
      }

      // Trigger onBlock callback
      onBlock?.();

      const confirmation = resolveConfirmResult(message, onConfirm, (value) =>
        window.confirm(value)
      );

      if (confirmation.kind === "async") {
        confirmation.promise
          .then((confirmed) => {
            if (confirmed) {
              onAllow?.();
              unblock();
              attemptRetry(update);
            }
          })
          .catch((error: unknown) => {
            // On error, unblock but don't retry
            unblock();
            if (process.env.NODE_ENV !== "production") {
              console.error("[react-action-guard-router] Confirmation error:", error);
            }
          });
        return;
      }

      if (confirmation.confirmed) {
        onAllow?.();
        unblock();
        attemptRetry(update);
      }
    });

    return () => {
      unblock();
    };
  }, [shouldBlock, message, onBlock, onAllow, router, onConfirm]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
  };
}
