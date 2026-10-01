import { useGuardedControl } from "../useGuardedControl";
import type { UseGuardedGroupParams, UseGuardedGroupReturn } from "./useGuardedGroup.types";

export function useGuardedGroup(params: UseGuardedGroupParams = {}): UseGuardedGroupReturn {
  const { reasonFallback, reasonId, reasonMode = "hidden", scope } = params;
  const control = useGuardedControl({
    kind: "group",
    reasonFallback,
    reasonId,
    reasonMode,
    scope,
  });

  return {
    blocker: control.blocker,
    isBlocked: control.isBlocked,
    groupState: control.controlState,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
