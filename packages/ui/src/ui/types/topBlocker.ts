import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { Nullable } from "@okyrychenko-dev/type-utils";

export type GuardedBlockStatus = "idle" | "blocked";

export interface UseTopBlockerReturn {
  status: GuardedBlockStatus;
  isBlocked: boolean;
  blockers: ReadonlyArray<BlockerInfo>;
  topBlocker: Nullable<BlockerInfo>;
  reason: Nullable<string>;
}
