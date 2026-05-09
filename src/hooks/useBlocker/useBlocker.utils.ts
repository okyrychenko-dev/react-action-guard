import { shallow } from "zustand/shallow";
import { DEFAULT_SCOPE } from "../../store";
import type { BlockerConfig } from "../../store";

type BlockerConfigSnapshotValue =
  | string
  | number
  | BlockerConfig["onTimeout"]
  | undefined;

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

function normalizeScopeSnapshot(
  scope?: string | ReadonlyArray<string>,
): ReadonlyArray<string> {
  if (scope === undefined) {
    return [DEFAULT_SCOPE];
  }

  if (typeof scope === "string") {
    return [scope];
  }

  return scope;
}

function getScopeSnapshotKey(scope?: string | ReadonlyArray<string>): string {
  return JSON.stringify(normalizeScopeSnapshot(scope));
}

function toBlockerConfigSnapshot(
  config: BlockerConfig,
): ReadonlyArray<BlockerConfigSnapshotValue> {
  return [
    getScopeSnapshotKey(config.scope),
    config.reason,
    config.priority,
    config.timestamp,
    config.timeout,
    config.onTimeout,
  ];
}

export function areBlockerConfigsEqual(first: BlockerConfig, second: BlockerConfig): boolean {
  return shallow(toBlockerConfigSnapshot(first), toBlockerConfigSnapshot(second));
}
