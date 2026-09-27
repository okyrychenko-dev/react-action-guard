/**
 * Next.js integration for react-action-guard. Pages Router can re-attempt confirmed
 * navigation; App Router interception is best effort.
 */

// Main export defaults to Pages Router for backwards compatibility
export { useNavigationBlocker } from "./usePagesRouterBlocker";

// Explicit exports for each router type
export { useNavigationBlocker as usePagesRouterBlocker } from "./usePagesRouterBlocker";
export { useNavigationBlocker as useAppRouterBlocker } from "./useAppRouterBlocker";

export type { UseNavigationBlockerOptions } from "./types";
