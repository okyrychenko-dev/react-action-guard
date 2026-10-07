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
import type { BlockedNavigationAttempt, UseNavigationBlockerOptions } from "./types";

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
  const [blockedAttempt, setBlockedAttempt] = useState<Nullable<BlockedNavigationAttempt>>(null);

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
        setBlockedAttempt(null);

        return false;
      }

      // Trigger onBlock callback
      onBlock?.();

      // If no message, just block
      if (!message) {
        setBlockedAttempt({ kind: "denied", settle, scopeKey, message });

        return true;
      }

      const confirmation = resolveConfirmResult(message, onConfirm, (value) =>
        window.confirm(value)
      );

      if (confirmation.kind === "async") {
        setBlockedAttempt({
          kind: "confirming",
          settle,
          promise: confirmation.promise.catch(() => false),
          scopeKey,
          message,
        });

        return true;
      }

      if (confirmation.confirmed && settle()) {
        setBlockedAttempt(null);
        onAllow?.();

        return false;
      }

      setBlockedAttempt({ kind: "denied", settle, scopeKey, message });

      return true;
    }, [shouldBlock, scopeKey, message, onBlock, onConfirm, onAllow, begin])
  );

  useEffect(() => {
    if (!blockedAttempt) {
      return;
    }

    // Compare protection values, not inline callback identities, before attaching completion.
    if (
      !shouldBlock ||
      blockedAttempt.scopeKey !== scopeKey ||
      blockedAttempt.message !== message
    ) {
      queueMicrotask(() => {
        setBlockedAttempt((current) => (current === blockedAttempt ? null : current));
      });

      if (blockedAttempt.settle()) {
        blocker.reset?.();
      }

      return;
    }

    if (blockedAttempt.kind === "denied") {
      return;
    }

    let active = true;
    const { settle, promise } = blockedAttempt;

    void promise.then((confirmed) => {
      if (!active || !settle()) {
        return;
      }

      setBlockedAttempt(null);

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
  }, [blockedAttempt, blocker, onAllow, shouldBlock, scopeKey, message]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
    isIntercepting: blocker.state === "blocked",
  };
}
