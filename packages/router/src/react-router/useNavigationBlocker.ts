import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import {
  DEFAULT_UNLOAD_MESSAGE,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { Nullable } from "@okyrychenko-dev/type-utils";
import type { NavigationBlockerReturn } from "../core/types";
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

  const confirmSeqRef = useRef(0);
  const [pendingConfirm, setPendingConfirm] = useState<
    Nullable<{
      id: number;
      promise: Promise<boolean>;
    }>
  >(null);

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
