import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import {
  DEFAULT_UNLOAD_MESSAGE,
  ROUTE_ERRORS,
  resolveConfirmResult,
  useBeforeUnload,
  useShouldBlock,
} from "../core";
import type { NavigationBlockerReturn } from "../core/types";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in Next.js Pages Router applications.
 *
 * This hook integrates with Next.js Pages Router's route change events and
 * react-action-guard's scope system to prevent navigation when certain conditions
 * are met or when specific scopes are blocked.
 *
 * **Note:** This hook ONLY works with Next.js Pages Router (pages/ directory).
 * For App Router, use the App Router adapter instead.
 *
 * **Features:**
 * - Block navigation based on boolean condition or function
 * - Automatically block when react-action-guard scopes are active
 * - Support for browser `beforeunload` event (tab close/refresh)
 * - Customizable confirmation dialog
 * - Callbacks for block/allow events
 *
 * **Custom confirm note:**
 * Async `onConfirm` is supported, but Pages Router requires a re-attempted
 * navigation after confirmation (via `router.push(url)` with default options).
 *
 * ⚠️ **Limitation:** When using async `onConfirm`, the re-attempted navigation
 * uses default options. Original `as`, `shallow`, `locale`, and `scroll` params
 * may be lost because Next.js Pages Router does not expose these in
 * the `routeChangeStart` event. For precise control, use synchronous confirmations.
 *
 * @param options - Configuration options
 * @returns Object with `isBlocking` state
 *
 * @example
 * ```tsx
 * // pages/edit.tsx
 * function EditPage() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useNavigationBlocker({
 *     when: hasChanges,
 *     message: 'You have unsaved changes. Leave anyway?',
 *   });
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Block based on scope
 * function CheckoutFlow() {
 *   useNavigationBlocker({
 *     scope: 'checkout',
 *     message: 'Your order is being processed. Please wait.',
 *   });
 * }
 * ```
 */
export function useNavigationBlocker(
  options: UseNavigationBlockerOptions
): NavigationBlockerReturn {
  const { when, scope, message, onBlock, onAllow, blockBrowserUnload = true, onConfirm } = options;

  const router = useRouter();
  const allowNextUrlRef = useRef<string | null>(null);

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
