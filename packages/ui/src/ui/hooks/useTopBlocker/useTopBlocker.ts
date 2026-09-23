import {
  type BlockerInfo,
  type StoredBlocker,
  normalizeScope,
  scopeAffectsObservation,
  useResolvedValue,
} from "@okyrychenko-dev/react-action-guard";
import { useMemo } from "react";
import type { GuardedScope, UseTopBlockerReturn } from "../../types";

function toBlockerInfo(id: string, blocker: StoredBlocker): BlockerInfo {
  const { timeoutId: _timeoutId, ...publicBlocker } = blocker;

  return { id, ...publicBlocker };
}

export function useTopBlocker(scope?: GuardedScope): UseTopBlockerReturn {
  const activeBlockers = useResolvedValue((state) => state.activeBlockers);
  const checkedScopes = useMemo(() => normalizeScope(scope), [scope]);

  const blockers = useMemo(() => {
    const scopedBlockers: Array<BlockerInfo> = [];

    for (const [id, blocker] of activeBlockers) {
      if (scopeAffectsObservation(blocker.scope, checkedScopes)) {
        scopedBlockers.push(toBlockerInfo(id, blocker));
      }
    }

    scopedBlockers.sort((first, second) => second.priority - first.priority);
    return scopedBlockers;
  }, [activeBlockers, checkedScopes]);

  return useMemo(() => {
    const topBlocker = blockers.length === 0 ? null : blockers[0];
    const isBlocked = topBlocker !== null;

    return {
      status: isBlocked ? "blocked" : "idle",
      isBlocked,
      blockers,
      topBlocker,
      reason: topBlocker?.reason ?? null,
    };
  }, [blockers]);
}
