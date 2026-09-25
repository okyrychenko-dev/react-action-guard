import type {
  BlockerInfo,
  BlockingLifecycleSnapshot,
  StoredBlocker,
} from "@okyrychenko-dev/react-action-guard";

export function getSortedBlockers(
  blockingSnapshot: BlockingLifecycleSnapshot
): Array<[string, BlockerInfo]> {
  return [...blockingSnapshot]
    .sort((first, second) => second.priority - first.priority)
    .map((blocker) => [blocker.id, blocker]);
}

/** Age of a blocker in milliseconds relative to `now`. */
export function getBlockerAge(blocker: StoredBlocker, now: number): number {
  return Math.max(0, now - blocker.timestamp);
}

/**
 * Whether a blocker has been active longer than the stuck threshold — a likely
 * sign of a missing `unblock()` call.
 */
export function isBlockerStuck(blocker: StoredBlocker, now: number, thresholdMs: number): boolean {
  return getBlockerAge(blocker, now) >= thresholdMs;
}
