import type { BaseNavigationBlockerOptions } from "../core/types";

/**
 * Options for TanStack Router navigation blocker
 *
 * Currently uses all base options. This type exists for
 * future TanStack Router-specific options extension.
 */
export type UseNavigationBlockerOptions = BaseNavigationBlockerOptions;

/**
 * Minimal interface for TanStack Router to ensure type safety
 */
export interface SafeTanStackRouter {
  history: {
    block: (callback: (update: Record<string, unknown>) => void) => () => void;
  };
}
