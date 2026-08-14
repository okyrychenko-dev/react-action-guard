/**
 * Next.js integration for react-action-guard
 *
 * This module provides navigation blocking capabilities for Next.js applications,
 * supporting both Pages Router (pages/) and App Router (app/).
 *
 * ## Pages Router (Full Support)
 *
 * Import from the main module:
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';
 * ```
 *
 * ## App Router (Limited Support)
 *
 * Import the App Router specific blocker:
 * ```tsx
 * import { useAppRouterBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';
 * ```
 *
 * **Note:** App Router support is limited due to Next.js API constraints.
 * For full navigation blocking, use Pages Router.
 *
 * @example
 * ```tsx
 * // pages/edit.tsx (Pages Router)
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';
 *
 * function EditPage() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useNavigationBlocker({
 *     when: hasChanges,
 *     message: 'You have unsaved changes',
 *   });
 * }
 * ```
 *
 * @example
 * ```tsx
 * // app/edit/page.tsx (App Router - Client Component)
 * 'use client';
 *
 * import { useAppRouterBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';
 *
 * function EditPage() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useAppRouterBlocker({
 *     when: hasChanges,
 *     message: 'You have unsaved changes',
 *   });
 * }
 * ```
 */

// Main export defaults to Pages Router for backwards compatibility
export { useNavigationBlocker } from "./usePagesRouterBlocker";

// Explicit exports for each router type
export { useNavigationBlocker as usePagesRouterBlocker } from "./usePagesRouterBlocker";
export { useNavigationBlocker as useAppRouterBlocker } from "./useAppRouterBlocker";

export type { UseNavigationBlockerOptions } from "./types";
