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
import type { Nullable } from "@okyrychenko-dev/type-utils";
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
    }>
  >(null);

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when ?? block, scope);

  const condition = when ?? block;
  const scopeKey = JSON.stringify([...new Set(normalizeScope(scope))].sort());

  useEffect(() => {
    return invalidate;
  }, [condition, scopeKey, shouldBlock, message, onConfirm, invalidate]);

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
        setPendingConfirm({ settle, promise: confirmation.promise.catch(() => false) });

        return true;
      }

      if (settle() && confirmation.confirmed) {
        onAllow?.();

        return false;
      }

      return true;
    }, [shouldBlock, message, onBlock, onConfirm, onAllow, begin])
  );

  useEffect(() => {
    if (!pendingConfirm) {
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
  }, [pendingConfirm, blocker, onAllow]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
    isIntercepting: blocker.state === "blocked",
  };
}
