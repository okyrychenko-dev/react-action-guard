import { ReasonConfig } from "../types";

/**
 * Resolves the appropriate blocking reason based on current state.
 * Uses a priority-based approach: checks conditions in order and returns the first matching reason.
 * Falls back to defaultReason if no specific reason is defined.
 *
 * @param config - Configuration with default and state-specific reasons
 * @returns The resolved reason string
 */
export function resolveBlockingReason(config: ReasonConfig): string {
  const { defaultReason, stateReasons } = config;

  for (const { condition, reason } of stateReasons) {
    if (condition && reason !== undefined) {
      return reason;
    }
  }

  return defaultReason;
}
