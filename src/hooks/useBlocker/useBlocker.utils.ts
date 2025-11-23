import { BlockerConfig } from "../../store";

/**
 * Creates a blocker configuration object from partial config.
 * Filters out undefined values to create a clean BlockerConfig.
 *
 * @param config - Partial blocker configuration
 * @returns Complete BlockerConfig object
 *
 */
export function createBlockerConfig(config: {
  scope?: string | ReadonlyArray<string>;
  reason?: string;
  priority?: number;
}): BlockerConfig {
  return {
    scope: config.scope,
    reason: config.reason,
    priority: config.priority,
  };
}
