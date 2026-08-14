/**
 * TanStack Router integration for react-action-guard
 *
 * This module provides navigation blocking capabilities for TanStack Router applications,
 * integrating seamlessly with react-action-guard's scope-based UI blocking system.
 *
 * TanStack Router is a modern, type-safe router with excellent TypeScript support.
 * This adapter works with the router's history blocking mechanism to prevent navigation.
 *
 * @example
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/tanstack-router';
 * import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';
 *
 * function EditForm() {
 *   useNavigationBlocker({
 *     scope: 'form',
 *     message: 'You have unsaved changes',
 *   });
 * }
 * ```
 */

export { useNavigationBlocker } from "./useNavigationBlocker";
export type { UseNavigationBlockerOptions } from "./types";
