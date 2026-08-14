import { useEffect } from "react";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../core";
import type { NavigationBlockerReturn } from "../core/types";
import type { UseNavigationBlockerOptions } from "./types";

/**
 * Blocks navigation in Next.js App Router applications.
 *
 * **⚠️ IMPORTANT LIMITATION:**
 * Next.js App Router (app/ directory) does not currently provide an official API
 * for blocking navigation. This implementation provides best-effort blocking using
 * available mechanisms, but has limitations:
 *
 * - ✅ Browser back/forward buttons are blocked via `beforeunload`
 * - ✅ Tab close/refresh is blocked via `beforeunload`
 * - ❌ Next.js `<Link>` components are NOT blocked
 * - ❌ Programmatic `router.push()` is NOT blocked
 * - ❌ Browser address bar navigation is NOT fully blocked
 *
 * For production use with full blocking capabilities, consider using Pages Router
 * or wait for official Next.js App Router blocking API.
 *
 * @param options - Configuration options
 * @returns Object with `isBlocking` state
 *
 * @example
 * ```tsx
 * // app/edit/page.tsx
 * 'use client';
 *
 * function EditPage() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useNavigationBlocker({
 *     when: hasChanges,
 *     message: 'You have unsaved changes.',
 *   });
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Block based on scope
 * 'use client';
 *
 * function CheckoutFlow() {
 *   useNavigationBlocker({
 *     scope: 'checkout',
 *     message: 'Your order is being processed.',
 *   });
 * }
 * ```
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

  // Best effort: Block browser navigation via beforeunload
  // This will prevent tab close, refresh, and some browser back/forward
  useBeforeUnload(blockBrowserUnload && shouldBlock, message ?? DEFAULT_UNLOAD_MESSAGE);

  return {
    isBlocking: shouldBlock,
  };
}
