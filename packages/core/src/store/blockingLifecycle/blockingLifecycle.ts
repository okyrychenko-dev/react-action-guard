import { isDefined, isString, isUndefined } from "@okyrychenko-dev/type-utils";
import { scopeAffectsObservation, scopeMatchesTarget } from "../scope";
import { DEFAULT_PRIORITY, DEFAULT_REASON, DEFAULT_SCOPE } from "../uiBlockingStore.constants";
import type { Middleware } from "../../middleware";
import type { BlockerConfig, BlockerInfo } from "../uiBlockingStore.types";
import type {
  BlockingEvent,
  BlockingLifecycle,
  BlockingLifecycleSnapshot,
  PendingPublication,
} from "./blockingLifecycle.types";

interface ActiveBlocker {
  config: BlockerInfo;
  timeoutId?: ReturnType<typeof setTimeout>;
}

function copyScope(scope: string | ReadonlyArray<string>): string | ReadonlyArray<string> {
  return isString(scope) ? scope : Object.freeze([...scope]);
}

function publicConfig(blocker: BlockerInfo): BlockerConfig {
  const { scope, reason, priority, timestamp, timeout, onTimeout } = blocker;

  return { scope, reason, priority, timestamp, timeout, onTimeout };
}

function freezeBlocker(blocker: BlockerInfo): BlockerInfo {
  return Object.freeze({ ...blocker, scope: copyScope(blocker.scope) });
}

function normalizeBlocker(id: string, config: BlockerConfig): BlockerInfo {
  return {
    id,
    scope: copyScope(config.scope ?? DEFAULT_SCOPE),
    reason: config.reason ?? DEFAULT_REASON,
    priority: Math.max(0, config.priority ?? DEFAULT_PRIORITY),
    timestamp: config.timestamp ?? Date.now(),
    timeout: config.timeout,
    onTimeout: config.onTimeout,
  };
}

/** Owns one independent store's blockers, timers, snapshots, and transition events. */
export function createBlockingLifecycle(): BlockingLifecycle {
  const blockers = new Map<string, ActiveBlocker>();
  const subscribers = new Map<symbol, (snapshot: BlockingLifecycleSnapshot) => void>();
  const observers = new Map<symbol, Middleware>();
  const pendingPublications: Array<PendingPublication> = [];
  let snapshot: BlockingLifecycleSnapshot = Object.freeze([]);
  let isDelivering = false;

  function getSnapshot(): BlockingLifecycleSnapshot {
    return snapshot;
  }

  function deliverEvent(event: BlockingEvent): void {
    const eventObservers = [...observers];

    for (const [registration, observer] of eventObservers) {
      if (!observers.has(registration)) {
        continue;
      }

      try {
        void Promise.resolve(observer(event)).catch(() => undefined);
      } catch {
        // Diagnostics must never interrupt a lifecycle transition.
      }
    }
  }

  function drainPublications(): void {
    if (isDelivering) {
      return;
    }

    isDelivering = true;

    try {
      for (const publication of pendingPublications) {
        if (publication.kind === "snapshot") {
          for (const subscriber of subscribers.values()) {
            try {
              subscriber(publication.snapshot);
            } catch {
              // A subscriber cannot interrupt lifecycle transitions.
            }
          }

          if (publication.event) {
            deliverEvent(publication.event);
          }
        } else {
          deliverEvent(publication.event);
        }
      }
    } finally {
      pendingPublications.length = 0;
      isDelivering = false;
    }
  }

  function publish(transitionEvent?: BlockingEvent): void {
    snapshot = Object.freeze(Array.from(blockers.values(), ({ config }) => freezeBlocker(config)));
    // Keep reads current while delivering each transition's snapshot and event in order.
    pendingPublications.push({ kind: "snapshot", snapshot, event: transitionEvent });
    drainPublications();
  }

  function emit(event: BlockingEvent): void {
    pendingPublications.push({ kind: "event", event });
    drainPublications();
  }

  function event(action: BlockingEvent["action"], blockerId: string): BlockingEvent {
    return { action, blockerId, timestamp: Date.now() };
  }

  function cancelTimeout(blocker: ActiveBlocker): void {
    if (isDefined(blocker.timeoutId)) {
      clearTimeout(blocker.timeoutId);
    }
  }

  function handleTimeout(id: string, blocker: ActiveBlocker): void {
    if (blockers.get(id) !== blocker) {
      return;
    }

    const { onTimeout } = blocker.config;

    try {
      onTimeout?.(id);
    } catch {
      // A user callback cannot prevent observation or cleanup.
    }

    const { scope, reason, priority, timeout: duration } = blocker.config;

    emit({
      ...event("timeout", id),
      config: { scope, reason, priority, timeout: duration },
    });

    if (blockers.get(id) === blocker) {
      remove(id);
    }
  }

  function scheduleTimeout(id: string, blocker: ActiveBlocker): void {
    const { timeout } = blocker.config;

    if (isUndefined(timeout) || timeout <= 0) {
      return;
    }

    blocker.timeoutId = setTimeout(() => {
      handleTimeout(id, blocker);
    }, timeout);
  }

  function add(id: string, config: BlockerConfig = {}): void {
    const previous = blockers.get(id);

    if (previous) {
      cancelTimeout(previous);
    }

    const blocker: ActiveBlocker = { config: normalizeBlocker(id, config) };

    blockers.set(id, blocker);

    scheduleTimeout(id, blocker);

    publish({
      ...event("add", id),
      config: {
        scope: config.scope,
        reason: config.reason,
        priority: config.priority,
        timeout: config.timeout,
      },
    });
  }

  function restore(nextBlockers: ReadonlyMap<string, BlockerConfig>): void {
    const restored = new Map<string, ActiveBlocker>();

    for (const [id, config] of nextBlockers) {
      const previous = blockers.get(id);
      const nextConfig = normalizeBlocker(id, config);

      if (!previous || previous.config.timeout !== nextConfig.timeout) {
        if (previous) {
          cancelTimeout(previous);
        }

        const blocker: ActiveBlocker = { config: nextConfig };

        restored.set(id, blocker);
        scheduleTimeout(id, blocker);
        continue;
      }

      previous.config = nextConfig;
      restored.set(id, previous);
    }

    for (const [id, blocker] of blockers) {
      if (!restored.has(id)) {
        cancelTimeout(blocker);
      }
    }

    blockers.clear();
    for (const [id, blocker] of restored) {
      blockers.set(id, blocker);
    }

    publish();
  }

  function update(id: string, config: Partial<BlockerConfig> = {}): void {
    const previous = blockers.get(id);

    if (!previous) {
      add(id, config);

      return;
    }

    const oldConfig = previous.config;
    const nextConfig: BlockerInfo = {
      ...oldConfig,
      scope: copyScope(config.scope ?? oldConfig.scope),
      reason: config.reason ?? oldConfig.reason,
      priority: Math.max(0, config.priority ?? oldConfig.priority),
      timestamp: config.timestamp ?? oldConfig.timestamp,
      timeout: config.timeout ?? oldConfig.timeout,
      onTimeout: config.onTimeout ?? oldConfig.onTimeout,
    };
    const timeoutChanged = !isUndefined(config.timeout) && config.timeout !== oldConfig.timeout;
    let blocker = previous;

    if (timeoutChanged) {
      cancelTimeout(previous);
      blocker = { config: nextConfig };
    } else {
      blocker.config = nextConfig;
    }

    blockers.set(id, blocker);

    if (timeoutChanged) {
      scheduleTimeout(id, blocker);
    }

    publish({
      ...event("update", id),
      config: publicConfig(nextConfig),
      prevState: publicConfig(oldConfig),
    });
  }

  function remove(id: string): void {
    const previous = blockers.get(id);

    if (previous) {
      cancelTimeout(previous);
    }

    blockers.delete(id);

    if (previous) {
      const config = publicConfig(previous.config);

      publish({ ...event("remove", id), config, prevState: config });
    } else {
      publish();
    }
  }

  function clear(): void {
    const count = blockers.size;

    for (const blocker of blockers.values()) {
      cancelTimeout(blocker);
    }

    blockers.clear();

    if (count > 0) {
      publish({ ...event("clear", "*"), count });
    } else {
      publish();
    }
  }

  function clearScope(scope: string): void {
    let count = 0;

    for (const [id, blocker] of blockers) {
      if (scopeMatchesTarget(blocker.config.scope, scope)) {
        cancelTimeout(blocker);
        blockers.delete(id);
        count++;
      }
    }

    if (count > 0) {
      publish({ ...event("clear_scope", "*"), scope, count });
    } else {
      publish();
    }
  }

  function isBlocked(scope: string | ReadonlyArray<string> = DEFAULT_SCOPE): boolean {
    for (const { config } of blockers.values()) {
      if (scopeAffectsObservation(config.scope, scope)) {
        return true;
      }
    }

    return false;
  }

  function getBlockingInfo(scope: string): BlockingLifecycleSnapshot {
    return Object.freeze(
      getSnapshot()
        .filter((blocker) => scopeAffectsObservation(blocker.scope, scope))
        .sort((a, b) => b.priority - a.priority)
    );
  }

  function subscribe(listener: (snapshot: BlockingLifecycleSnapshot) => void): VoidFunction {
    const registration = Symbol();

    subscribers.set(registration, listener);

    return () => {
      subscribers.delete(registration);
    };
  }

  function observe(observer: Middleware): VoidFunction {
    const registration = Symbol();

    observers.set(registration, observer);

    return () => {
      observers.delete(registration);
    };
  }

  return {
    restore,
    add,
    update,
    remove,
    clear,
    clearScope,
    isBlocked,
    getBlockingInfo,
    getSnapshot,
    subscribe,
    observe,
  };
}
