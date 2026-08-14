/**
 * React Router v6+ integration for react-action-guard
 *
 * This module provides navigation blocking capabilities for React Router applications,
 * integrating seamlessly with react-action-guard's scope-based UI blocking system.
 *
 * @example
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';
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
export { usePrompt, usePromptWithOptions } from "./usePrompt";
export type { UseNavigationBlockerOptions, UsePromptOptions } from "./types";
