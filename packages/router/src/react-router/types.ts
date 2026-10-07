import type { Optional } from "@okyrychenko-dev/type-utils";
import type { BaseNavigationBlockerOptions } from "../core";

/**
 * Options for React Router navigation blocker
 */
export interface UseNavigationBlockerOptions extends BaseNavigationBlockerOptions {
  /**
   * Whether to block navigation
   * @deprecated Use `when` instead for consistency across adapters
   */
  block?: boolean | (() => boolean);
}

/**
 * Simple prompt options (React Router v5 compatibility)
 */
export type UsePromptOptions = Omit<BaseNavigationBlockerOptions, "message" | "when" | "scope"> & {
  /**
   * Message to show in confirmation dialog
   */
  message: string;

  /**
   * When to show the prompt
   */
  when: boolean | (() => boolean);
};

interface NavigationAttemptOwnership {
  settle: () => boolean;
  scopeKey: string;
  message: Optional<string>;
}

export interface ConfirmingNavigationAttempt extends NavigationAttemptOwnership {
  kind: "confirming";
  promise: Promise<boolean>;
}

export interface DeniedNavigationAttempt extends NavigationAttemptOwnership {
  kind: "denied";
}

export type BlockedNavigationAttempt = ConfirmingNavigationAttempt | DeniedNavigationAttempt;
