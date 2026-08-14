/**
 * @okyrychenko-dev/react-action-guard-router
 *
 * Router integration for React Action Guard - navigation blocking for
 * React Router, TanStack Router, and Next.js.
 *
 * ## Usage
 *
 * This package provides router-specific adapters as subpath exports.
 * Import the adapter you need for your router:
 *
 * ### React Router v6+
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/react-router';
 * ```
 *
 * ### TanStack Router
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/tanstack-router';
 * ```
 *
 * ### Next.js (Pages or App Router)
 * ```tsx
 * import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';
 * ```
 *
 * ## Core Utilities
 *
 * The main export provides core utilities that work across all routers:
 */

export { useBeforeUnload } from "./core/useBeforeUnload";
export { useDialogState } from "./core/useDialogState";
export { resolveCondition, createBlockerId, isDefined, normalizeScope } from "./core/utils";
export type {
  BaseNavigationBlockerOptions,
  BeforeUnloadOptions,
  NavigationBlockerReturn,
} from "./core/types";
export type { DialogState, UseDialogStateReturn } from "./core/useDialogState";
