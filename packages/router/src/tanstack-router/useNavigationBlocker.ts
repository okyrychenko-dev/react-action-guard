import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  createConfirmationOwner,
  normalizeScope,
  resolveConfirmResult,
  useShouldBlock,
} from "../core";
import type { NavigationBlockerReturn } from "../core";
import type { UseNavigationBlockerOptions } from "./types";

/** Blocks native TanStack transitions while retaining protection after confirmation. */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, onBlock, onAllow, blockBrowserUnload = true, onConfirm } = options;

  const shouldBlock = useShouldBlock(when, scope);
  const scopeKey = JSON.stringify([...new Set(normalizeScope(scope))].sort());
  const [confirmationOwner] = useState(createConfirmationOwner);

  const { begin, invalidate } = confirmationOwner;

  useEffect(() => {
    return invalidate;
  }, [when, scopeKey, shouldBlock, message, onConfirm, invalidate]);

  const shouldBlockFn = useCallback(async () => {
    const settle = begin();

    onBlock?.();

    if (!message) {
      return true;
    }

    try {
      const confirmation = resolveConfirmResult(message, onConfirm, (value) =>
        window.confirm(value)
      );
      let confirmed: boolean;

      if (confirmation.kind === "async") {
        confirmed = await confirmation.promise;
      } else {
        confirmed = confirmation.confirmed;
      }

      if (!settle() || !confirmed) {
        return true;
      }

      onAllow?.();

      return false;
    } catch {
      return true;
    }
  }, [message, onBlock, onAllow, onConfirm, begin]);

  useBlocker({
    shouldBlockFn,
    enableBeforeUnload: blockBrowserUnload && shouldBlock,
    disabled: !shouldBlock,
  });

  return { isBlocking: shouldBlock };
}
