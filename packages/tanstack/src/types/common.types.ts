/**
 * Base configuration shared by all blocking hooks.
 * Defines common properties for UI blocking behavior.
 */
export interface BaseBlockingConfig {
  /**
   * Scope(s) to block. Can be a single string or array of strings.
   * Use scopes to control which parts of your UI should be blocked.
   */
  scope?: string | ReadonlyArray<string>;
  /**
   * Priority level for this blocker.
   * Higher priority blockers take precedence when multiple blockers are active.
   */
  priority?: number;
  /**
   * Default message for blocking states.
   * Can be overridden by specific state reasons.
   */
  reason?: string;
  /**
   * Automatically remove the blocker after N milliseconds.
   * Useful for preventing stale blockers when requests hang.
   */
  timeout?: number;
  /**
   * Callback invoked when the blocker is automatically removed due to timeout.
   */
  onTimeout?: (blockerId: string) => void;
}

/**
 * State-based reason configuration for dynamic blocking messages.
 */
export interface ReasonConfig {
  /** Default reason to use when no specific reason is provided */
  defaultReason: string;
  /** Map of state conditions to their specific reasons */
  stateReasons: ReadonlyArray<{
    /** Condition that must be true for this reason to be used */
    condition: boolean;
    /** Reason to use when condition is true */
    reason: string | undefined;
  }>;
}
