import type { BlockerConfig } from "../../store";

/**
 * Configuration for conditional blocker hook.
 *
 * Note: Unlike the base BlockerConfig, the scope property is required here
 * because conditional blockers must have a defined scope to check against.
 */
export interface ConditionalBlockerConfig<TState = unknown> extends Omit<BlockerConfig, "scope"> {
  /** Required scope(s) to block. Unlike base BlockerConfig, this is mandatory for conditional blockers. */
  scope: string | ReadonlyArray<string>;
  /** Function that determines whether blocking should be active */
  condition: (state?: TState) => boolean;
  /** Interval in milliseconds to check the condition (default: 1000ms) */
  checkInterval?: number;
  /** Optional state to pass to the condition function */
  state?: TState;
}
