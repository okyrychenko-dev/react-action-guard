import { shallow } from "zustand/shallow";
import { normalizeScope } from "../../store";
import type { Optional } from "@okyrychenko-dev/type-utils";
import type { BlockerConfig } from "../../store";

type BlockerConfigSnapshotValue = Optional<string | number | BlockerConfig["onTimeout"]>;

const activeHookRegistrations = new WeakMap<object, Map<string, number>>();

export function trackHookRegistration(store: object, blockerId: string): VoidFunction {
  if (process.env.NODE_ENV === "production") {
    return () => undefined;
  }

  const registrations = activeHookRegistrations.get(store) ?? new Map<string, number>();
  const count = registrations.get(blockerId) ?? 0;

  activeHookRegistrations.set(store, registrations);
  registrations.set(blockerId, count + 1);

  if (count > 0) {
    console.warn(
      `[react-action-guard] Multiple active useActionBlocker hooks registered ID "${blockerId}" in the same store. Use a unique ID per hook; shared IDs can overwrite configuration or remove another hook's blocker during cleanup.`
    );
  }

  return () => {
    const remaining = (registrations.get(blockerId) ?? 1) - 1;

    if (remaining > 0) {
      registrations.set(blockerId, remaining);
    } else {
      registrations.delete(blockerId);
    }

    if (registrations.size === 0) {
      activeHookRegistrations.delete(store);
    }
  };
}

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

function getScopeSnapshotKey(scope?: string | ReadonlyArray<string>): string {
  return JSON.stringify(normalizeScope(scope));
}

function toBlockerConfigSnapshot(config: BlockerConfig): ReadonlyArray<BlockerConfigSnapshotValue> {
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
