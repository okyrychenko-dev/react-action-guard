import { isFunction, isObject } from "@okyrychenko-dev/type-utils";
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
  if (!isObject(value)) {
    return false;
  }
  if (!("history" in value)) {
    return false;
  }

  const history = value.history;

  if (!isObject(history)) {
    return false;
  }
  if (!("block" in history)) {
    return false;
  }

  return isFunction(history.block);
};

const hasRetry = (value: Record<string, unknown>): value is RetryableUpdate =>
  isFunction(value.retry);

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
