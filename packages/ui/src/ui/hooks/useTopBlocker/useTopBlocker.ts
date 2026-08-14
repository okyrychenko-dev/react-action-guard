import {
  type BlockerInfo,
  type StoredBlocker,
  useResolvedValue,
} from "@okyrychenko-dev/react-action-guard";
import { useMemo } from "react";
import { DEFAULT_GUARDED_SCOPE } from "../../constants";
import { normalizeGuardedScope } from "../../utils";
import type { GuardedScope, UseTopBlockerReturn } from "../../types";

interface BlockerScopeSnapshot {
  scope?: StoredBlocker["scope"];
}

function blockerAffectsScope(
  blocker: BlockerScopeSnapshot,
  checkedScopes: ReadonlyArray<string>,
): boolean {
  if (blocker.scope === undefined || blocker.scope === DEFAULT_GUARDED_SCOPE) {
    return true;
  }

  const blockerScopes = normalizeGuardedScope(blocker.scope);
  return checkedScopes.some((scope) => blockerScopes.includes(scope));
}

function toBlockerInfo(id: string, blocker: StoredBlocker): BlockerInfo {
  const { timeoutId: _timeoutId, ...publicBlocker } = blocker;
  return { id, ...publicBlocker };
}

export function useTopBlocker(scope?: GuardedScope): UseTopBlockerReturn {
  const activeBlockers = useResolvedValue((state) => state.activeBlockers);
  const checkedScopes = useMemo(() => normalizeGuardedScope(scope), [scope]);

  const blockers = useMemo(() => {
    const scopedBlockers: Array<BlockerInfo> = [];

    for (const [id, blocker] of activeBlockers) {
      if (blockerAffectsScope(blocker, checkedScopes)) {
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
