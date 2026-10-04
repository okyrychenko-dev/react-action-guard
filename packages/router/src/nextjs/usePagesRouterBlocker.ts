import { useRouter } from "next/router.js";
import { useEffect, useRef } from "react";
import {
  DEFAULT_UNLOAD_MESSAGE,
  ROUTE_ERRORS,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { Nullable } from "@okyrychenko-dev/type-utils";
import type { NavigationBlockerReturn } from "../core/types";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in Next.js Pages Router applications.
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, onBlock, onAllow, blockBrowserUnload = true, onConfirm } = options;

  const router = useRouter();
  const allowNextUrlRef = useRef<Nullable<string>>(null);

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when, scope);

  // Block navigation using Next.js router events
  useEffect(() => {
    if (!shouldBlock) {
      return;
    }

    const handleRouteChangeStart = (url: string): void => {
      // Early return for allowed URL
      if (allowNextUrlRef.current === url) {
        allowNextUrlRef.current = null;
        onAllow?.();

        return;
      }

      // Trigger onBlock callback
      onBlock?.();

      // If no message, block silently
      if (!message) {
        router.events.emit("routeChangeError");
        throw new Error(ROUTE_ERRORS.BLOCKED);
      }

      const confirmation = resolveConfirmResult(message, onConfirm, (value) =>
        window.confirm(value)
      );

      if (confirmation.kind === "sync" && !confirmation.confirmed) {
        router.events.emit("routeChangeError");
        throw new Error(ROUTE_ERRORS.ABORTED);
      }

      if (confirmation.kind === "sync") {
        onAllow?.();

        return;
      }

      router.events.emit("routeChangeError");
      confirmation.promise
        .then((confirmed) => {
          if (confirmed) {
            allowNextUrlRef.current = url;
            onAllow?.();
            void router.push(url);
          }
        })
        .catch(() => {
          // On error, treat as cancelled
        });
      throw new Error(ROUTE_ERRORS.ABORTED);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [shouldBlock, message, onBlock, onAllow, router, onConfirm]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
  };
}
