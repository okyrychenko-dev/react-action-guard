import {
  type BlockerInfo,
  normalizeScope,
  scopeAffectsObservation,
  useResolvedValue,
} from "@okyrychenko-dev/react-action-guard";
import { isNonEmptyArray, isNull } from "@okyrychenko-dev/type-utils";
import { useMemo } from "react";
import type { GuardedScope, UseTopBlockerReturn } from "../../types";

export function useTopBlocker(scope?: GuardedScope): UseTopBlockerReturn {
  const blockingSnapshot = useResolvedValue((state) => state.blockingSnapshot);
  const checkedScopes = useMemo(() => normalizeScope(scope), [scope]);

  const blockers = useMemo(() => {
    const scopedBlockers: Array<BlockerInfo> = [];

    for (const blocker of blockingSnapshot) {
      if (scopeAffectsObservation(blocker.scope, checkedScopes)) {
        scopedBlockers.push(blocker);
      }
    }

    scopedBlockers.sort((first, second) => second.priority - first.priority);

    return scopedBlockers;
  }, [blockingSnapshot, checkedScopes]);

  return useMemo(() => {
    const topBlocker = isNonEmptyArray(blockers) ? blockers[0] : null;
    const isBlocked = !isNull(topBlocker);

    return {
      status: isBlocked ? "blocked" : "idle",
      isBlocked,
      blockers,
      topBlocker,
      reason: topBlocker?.reason ?? null,
    };
  }, [blockers]);
}
