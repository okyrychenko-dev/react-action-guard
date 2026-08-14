import type { StoredBlocker } from "@okyrychenko-dev/react-action-guard";

export function getSortedBlockers(
  activeBlockers: ReadonlyMap<string, StoredBlocker>
): Array<[string, StoredBlocker]> {
  return Array.from(activeBlockers.entries()).sort(([, a], [, b]) => b.priority - a.priority);
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
