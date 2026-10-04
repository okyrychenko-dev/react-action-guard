import { useEffect } from "react";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../core";
import type { NavigationBlockerReturn } from "../core/types";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in Next.js App Router applications.
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, blockBrowserUnload = true } = options;

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when, scope);

  // Log warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && shouldBlock) {
      console.warn(
        "[react-action-guard-router] App Router has limited blocking support. " +
          "Link clicks cannot be blocked. Use Pages Router for full support."
      );
    }
  }, [shouldBlock]);

  // Request a native prompt on document unload, subject to browser policy.
  // Same-document App Router back/forward does not trigger beforeunload.
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
  };
}
