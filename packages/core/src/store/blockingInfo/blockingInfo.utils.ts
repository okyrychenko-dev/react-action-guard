import { type Optional, isDefined, isString } from "@okyrychenko-dev/type-utils";
import { createScopeObservationMatcher } from "../scope";
import type { BlockingLifecycleSnapshot } from "../blockingLifecycle";
import type { Scope } from "../scope";
import type { BlockerInfo, UIBlockingStore } from "../uiBlockingStore.types";

function sameScope(first: Scope, second: Scope): boolean {
  if (first === second) {
    return true;
  }
  if (isString(first) || isString(second)) {
    return false;
  }

  return first.length === second.length && first.every((scope, index) => scope === second[index]);
}

function sameBlocker(first: BlockerInfo, second: BlockerInfo): boolean {
  if (first === second) {
    return true;
  }

  const { id, scope, reason, priority, timestamp, timeout, onTimeout } = first;
  const {
    id: previousId,
    scope: previousScope,
    reason: previousReason,
    priority: previousPriority,
    timestamp: previousTimestamp,
    timeout: previousTimeout,
    onTimeout: previousOnTimeout,
  } = second;

  return (
    id === previousId &&
    sameScope(scope, previousScope) &&
    reason === previousReason &&
    priority === previousPriority &&
    timestamp === previousTimestamp &&
    timeout === previousTimeout &&
    onTimeout === previousOnTimeout
  );
}

export function areBlockingInfosEqual(
  first: BlockingLifecycleSnapshot,
  second: BlockingLifecycleSnapshot
): boolean {
  return (
    first === second ||
    (first.length === second.length &&
      first.every((blocker, index) => {
        const previous = second[index];

        return isDefined(previous) && sameBlocker(blocker, previous);
      }))
  );
}

function matchingBlockers(
  snapshot: BlockingLifecycleSnapshot,
  matchesScope: ReturnType<typeof createScopeObservationMatcher>
): Array<BlockerInfo> {
  return snapshot.filter(({ scope }) => matchesScope(scope));
}

function orderedBlockers(blockers: Array<BlockerInfo>): BlockingLifecycleSnapshot {
  return Object.freeze(
    blockers.sort(({ priority: first }, { priority: second }) => second - first)
  );
}

export function projectBlockingInfo(
  snapshot: BlockingLifecycleSnapshot,
  scope: Scope
): BlockingLifecycleSnapshot {
  const matchesScope = createScopeObservationMatcher(scope);

  return orderedBlockers(matchingBlockers(snapshot, matchesScope));
}

/** One hook-owned last snapshot/projection; released with its selector, never cached globally. */
export function createBlockingInfoSelector(
  scope: Scope
): (state: UIBlockingStore) => BlockingLifecycleSnapshot {
  const matchesScope = createScopeObservationMatcher(scope);
  let previousSnapshot: Optional<BlockingLifecycleSnapshot>;
  let previousMatches: ReadonlyArray<BlockerInfo> = [];
  let result: BlockingLifecycleSnapshot = Object.freeze([]);

  return ({ blockingSnapshot }) => {
    if (blockingSnapshot === previousSnapshot) {
      return result;
    }

    const matches = matchingBlockers(blockingSnapshot, matchesScope);
    const unchanged = areBlockingInfosEqual(matches, previousMatches);

    previousSnapshot = blockingSnapshot;

    if (!unchanged) {
      previousMatches = matches;
      result = orderedBlockers([...matches]);
    }

    return result;
  };
}
