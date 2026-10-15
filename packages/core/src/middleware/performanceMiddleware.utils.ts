import type { PerformanceConfig, TrackedPerformanceBlock } from "./performanceMiddleware.types";

export function finalizeTrackedBlocks(
  endedBlocks: ReadonlyMap<string, TrackedPerformanceBlock>,
  timestamp: number,
  threshold: number,
  onSlowBlock: PerformanceConfig["onSlowBlock"]
): void {
  for (const [id, tracked] of endedBlocks) {
    const duration = timestamp - tracked.timestamp;

    if (duration >= threshold) {
      try {
        onSlowBlock?.(id, duration);
      } catch {
        // One consumer failure must not prevent finalization of other lifetimes.
      }
    }
  }
}
