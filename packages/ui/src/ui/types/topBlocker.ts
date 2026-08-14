import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";

export type GuardedBlockStatus = "idle" | "blocked";

export interface UseTopBlockerReturn {
  status: GuardedBlockStatus;
  isBlocked: boolean;
  blockers: ReadonlyArray<BlockerInfo>;
  topBlocker: BlockerInfo | null;
  reason: string | null;
}
