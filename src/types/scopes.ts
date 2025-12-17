/**
 * Default scope type
 */
export type DefaultScopes = "global";

/**
 * Utility type for scope values - can be a single scope or array of scopes
 */
export type ScopeValue<TScope extends string = string> = TScope | ReadonlyArray<TScope>;

/**
 * Type-safe blocker configuration with generic scope type
 */
export interface BlockerConfigTyped<TScope extends string> {
  /** Scope(s) to block */
  scope?: ScopeValue<TScope>;
  /** Human-readable reason for blocking */
  reason?: string;
  /** Priority level (higher priority blockers take precedence) */
  priority?: number;
  /** Timestamp when the blocker was created */
  timestamp?: number;
  /** Timeout in milliseconds after which the blocker will be automatically removed */
  timeout?: number;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}
