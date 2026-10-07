import { useCallback, useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";
import {
  DEFAULT_UNLOAD_MESSAGE,
  createConfirmationOwner,
  normalizeScope,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { Nullable, Optional } from "@okyrychenko-dev/type-utils";
import type { NavigationBlockerReturn } from "../core";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in React Router v6+ applications based on conditions or scope state.
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

  const [confirmationOwner] = useState(createConfirmationOwner);
  const { begin, invalidate } = confirmationOwner;
  const [pendingConfirm, setPendingConfirm] = useState<
    Nullable<{
      settle: () => boolean;
      promise: Promise<boolean>;
      scopeKey: string;
      message: Optional<string>;
    }>
  >(null);

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when ?? block, scope);

  const scopeKey = JSON.stringify([...new Set(normalizeScope(scope))].sort());

  useEffect(() => {
    return invalidate;
  }, [invalidate]);

  // Use React Router's blocker
  const blocker = useBlocker(
    useCallback(() => {
      const settle = begin();

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
        setPendingConfirm({
          settle,
          promise: confirmation.promise.catch(() => false),
          scopeKey,
          message,
        });

        return true;
      }

      if (settle() && confirmation.confirmed) {
        onAllow?.();

        return false;
      }

      return true;
    }, [shouldBlock, scopeKey, message, onBlock, onConfirm, onAllow, begin])
  );

  useEffect(() => {
    if (!pendingConfirm) {
      return;
    }

    // Compare protection values, not inline callback identities, before attaching completion.
    if (
      !shouldBlock ||
      pendingConfirm.scopeKey !== scopeKey ||
      pendingConfirm.message !== message
    ) {
      queueMicrotask(() => {
        setPendingConfirm((current) => (current === pendingConfirm ? null : current));
      });

      if (pendingConfirm.settle()) {
        blocker.reset?.();
      }

      return;
    }

    let active = true;
    const { settle, promise } = pendingConfirm;

    void promise.then((confirmed) => {
      if (!active || !settle()) {
        return;
      }

      setPendingConfirm(null);

      if (confirmed) {
        onAllow?.();
        blocker.proceed?.();
      } else {
        blocker.reset?.();
      }
    });

    return () => {
      active = false;
    };
  }, [pendingConfirm, blocker, onAllow, shouldBlock, scopeKey, message]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
    isIntercepting: blocker.state === "blocked",
  };
}
