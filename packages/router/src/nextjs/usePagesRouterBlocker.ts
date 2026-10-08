import { useRouter } from "next/router.js";
import { useInsertionEffect, useRef } from "react";
import {
  DEFAULT_UNLOAD_MESSAGE,
  ROUTE_ERRORS,
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
 * Blocks navigation in Next.js Pages Router applications.
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, onBlock, onAllow, blockBrowserUnload = true, onConfirm } = options;

  const router = useRouter();
  const callbacksRef = useRef({ onBlock, onAllow, onConfirm });

  // Publish committed callbacks before any component can navigate from a layout effect.
  // Callback identity changes do not replace the protected navigation attempt.
  useInsertionEffect(() => {
    callbacksRef.current = { onBlock, onAllow, onConfirm };
  }, [onBlock, onAllow, onConfirm]);

  // Use shared logic to determine if blocking should be active
  const shouldBlock = useShouldBlock(when, scope);

  const scopeKey = JSON.stringify([...new Set(normalizeScope(scope))].sort());

  // Replace protection and its listener before layout-triggered navigation can run.
  useInsertionEffect(() => {
    if (!shouldBlock) {
      return;
    }

    const confirmationOwner = createConfirmationOwner();
    let allowedNavigation: Nullable<{ url: string }> = null;
    let currentAttempt: Nullable<() => boolean> = null;

    function handleRouteChangeStart(url: string): void {
      // Early return for allowed URL
      if (allowedNavigation?.url === url) {
        allowedNavigation = null;

        return;
      }

      allowedNavigation = null;

      const settle = confirmationOwner.begin();

      currentAttempt = settle;

      const { onBlock, onAllow, onConfirm } = callbacksRef.current;

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
        if (!settle()) {
          router.events.emit("routeChangeError");
          throw new Error(ROUTE_ERRORS.ABORTED);
        }

        onAllow?.();

        if (currentAttempt !== settle) {
          router.events.emit("routeChangeError");
          throw new Error(ROUTE_ERRORS.ABORTED);
        }

        return;
      }

      router.events.emit("routeChangeError");
      async function complete(confirmed: boolean): Promise<void> {
        if (!settle() || !confirmed) {
          return;
        }

        const permission = { url };

        allowedNavigation = permission;

        const { onAllow: notifyAllow } = callbacksRef.current;

        try {
          notifyAllow?.();

          // User callbacks can replace the attempt or detach this listener synchronously.
          if (allowedNavigation !== permission) {
            return;
          }

          await router.push(url);
        } finally {
          if (allowedNavigation === permission) {
            allowedNavigation = null;
          }
        }
      }

      // Treat confirmation, callback and retry failures as cancellation.
      void confirmation.promise.then(complete).catch(() => complete(false));
      throw new Error(ROUTE_ERRORS.ABORTED);
    }

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      confirmationOwner.invalidate();
      currentAttempt = null;
      allowedNavigation = null;
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [shouldBlock, scopeKey, message, router]);

  // Also block browser unload if requested
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
  };
}
