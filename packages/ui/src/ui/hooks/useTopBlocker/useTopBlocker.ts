import { useBlockingInfo } from "@okyrychenko-dev/react-action-guard";
import { isNonEmptyArray, isNull } from "@okyrychenko-dev/type-utils";
import { useMemo } from "react";
import type { GuardedScope, UseTopBlockerReturn } from "../../types";

export function useTopBlocker(scope?: GuardedScope): UseTopBlockerReturn {
  const blockers = useBlockingInfo(scope);

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
