import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import {
  DEFAULT_UNLOAD_MESSAGE,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { NavigationBlockerReturn } from "../core/types";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in React Router v6+ applications based on conditions or scope state.
 *
 * This hook integrates React Router's `useBlocker` with react-action-guard's scope system,
 * allowing you to prevent navigation when certain conditions are met or when specific
 * scopes are blocked.
 *
 * **Features:**
 * - Block navigation based on boolean condition or function
 * - Automatically block when react-action-guard scopes are active
 * - Support for browser `beforeunload` event (tab close/refresh)
 * - Customizable confirmation dialog configuration
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
 * // Block with custom dialog
 * function CheckoutFlow() {
 *   useNavigationBlocker({
 *     scope: 'checkout',
 *     message: 'Your items will still be in your cart.',
 *     blockBrowserUnload: true,
 *   });
 * }
 * ```
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const {
    when,
    scope,
    message,
    blockBrowserUnload = true,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    block, // deprecated, for backwards compatibility
    onBlock,
    onAllow,
    onConfirm,
  } = options;

  const confirmSeqRef = useRef(0);
  const [pendingConfirm, setPendingConfirm] = useState<{
    id: number;
    promise: Promise<boolean>;
  } | null>(null);

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when ?? block, scope);

  // Use React Router's blocker
  const blocker = useBlocker(
    useCallback(() => {
      // Early return if not blocking
      if (!shouldBlock) {
        return false;
      }

      // Trigger onBlock callback
      onBlock?.();

      // If no message, just block
      if (!message) {
        return true;
      }

      const confirmation = resolveConfirmResult(message, onConfirm, (value) =>
        window.confirm(value)
      );

      if (confirmation.kind === "async") {
        const id = ++confirmSeqRef.current;
        setPendingConfirm({ id, promise: confirmation.promise });
        return true;
      }

      if (confirmation.confirmed) {
        onAllow?.();
        return false;
      }

      return true;
    }, [shouldBlock, message, onBlock, onConfirm, onAllow])
  );

  useEffect(() => {
    if (!pendingConfirm) {
      return;
    }

    let active = true;
    const { id, promise } = pendingConfirm;

    promise
      .then((confirmed) => {
        if (!active || id !== confirmSeqRef.current) {
          return;
        }
        if (confirmed) {
          onAllow?.();
          blocker.proceed?.();
        } else {
          blocker.reset?.();
        }
      })
      .catch(() => {
        if (active && id === confirmSeqRef.current) {
          blocker.reset?.();
        }
      })
      .finally(() => {
        if (active && id === confirmSeqRef.current) {
          setPendingConfirm(null);
        }
      });

    return () => {
      active = false;
    };
  }, [pendingConfirm, blocker, onAllow]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
    isIntercepting: blocker.state === "blocked",
  };
}
