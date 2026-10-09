import { type BlockerConfig, normalizeScope } from "@okyrychenko-dev/react-action-guard";
import { type Optional, isDefined } from "@okyrychenko-dev/type-utils";
import type { MutationBlockingConfig } from "../../hooks/useBlockingMutation.types";
import type {
  MutationExecutionOptions,
  MutationExecutionOwner,
  MutationRegistrationEpisode,
} from "./mutationExecution.types";

function areRegistrationScopesEqual(previous: BlockerConfig, current: BlockerConfig): boolean {
  const previousScopes = normalizeScope(previous.scope);
  const currentScopes = normalizeScope(current.scope);

  return (
    previousScopes.length === currentScopes.length &&
    previousScopes.every((scope, index) => scope === currentScopes[index])
  );
}

function areRegistrationConfigsEqual(previous: BlockerConfig, current: BlockerConfig): boolean {
  return (
    areRegistrationScopesEqual(previous, current) &&
    previous.reason === current.reason &&
    previous.priority === current.priority &&
    previous.timeout === current.timeout
  );
}

/** Matches the native observer's reset rule: both keys exist and their hashes differ. */
export function hasMutationObserverKeyChanged(
  previous: Optional<string>,
  current: Optional<string>
): boolean {
  return isDefined(previous) && isDefined(current) && previous !== current;
}

/** Accounts for native executions independently of the latest observer. */
export function createMutationExecutionOwner(
  options: MutationExecutionOptions
): MutationExecutionOwner {
  const { store, id, observation } = options;

  let config: MutationBlockingConfig = {};
  const pending = new Set<symbol>();
  const { addBlocker, replaceBlocker, removeBlocker } = store.getState();
  let attached = false;
  let release: Optional<VoidFunction>;
  let episode: MutationRegistrationEpisode = { kind: "idle" };

  function handleTimeout(blockerId: string): void {
    episode = { kind: "expired" };

    config.onTimeout?.(blockerId);
  }

  function currentConfig(): BlockerConfig {
    const { scope, timeout } = config;
    const priority = config.priority ?? 30;
    const onTimeout = handleTimeout;
    let reason = config.reason ?? "Saving changes...";

    if (pending.size > 0) {
      reason = config.reasonOnPending ?? reason;
    } else if (observation.isError() && config.onError) {
      reason = config.reasonOnError ?? reason;
    }

    return { scope, reason, priority, timeout, onTimeout };
  }

  function hasEligibleErrorProtection(): boolean {
    return attached && observation.isError() && config.onError === true;
  }

  function synchronize(): void {
    const protectedWork = pending.size > 0 || hasEligibleErrorProtection();

    if (!protectedWork) {
      if (episode.kind !== "idle") {
        episode = { kind: "idle" };

        removeBlocker(id);
      }

      return;
    }
    if (episode.kind === "expired") {
      return;
    }

    const nextConfig = currentConfig();

    if (episode.kind === "idle") {
      episode = { kind: "active", config: nextConfig };

      addBlocker(id, nextConfig);
    } else if (!areRegistrationConfigsEqual(episode.config, nextConfig)) {
      episode = { kind: "active", config: nextConfig };

      replaceBlocker(id, nextConfig);
    }
  }

  function begin(): symbol {
    const token = Symbol();

    pending.add(token);
    synchronize();

    return token;
  }

  function finish(token: symbol): void {
    if (!pending.delete(token)) {
      return;
    }

    observation.refresh();
    synchronize();
  }

  function configure(nextConfig: MutationBlockingConfig): void {
    config = { ...nextConfig, scope: normalizeScope(nextConfig.scope) };
  }

  function attach(): void {
    attached = true;

    release ??= observation.subscribe(synchronize);

    synchronize();
  }

  function detach(): void {
    attached = false;
    release?.();
    release = undefined;
    synchronize();
  }

  return {
    begin,
    finish,
    configure,
    refresh: synchronize,
    reset: observation.refresh,
    attach,
    detach,
  };
}
