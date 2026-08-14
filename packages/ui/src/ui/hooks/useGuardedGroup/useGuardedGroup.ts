import { useCallback } from "react";
import { resolveActionReason, resolveGuardedGroupState } from "../../utils";
import { useGuardedControl } from "../useGuardedControl";
import type {
  UseGuardedGroupParams,
  UseGuardedGroupReturn,
} from "./useGuardedGroup.types";

export function useGuardedGroup(
  params: UseGuardedGroupParams = {},
): UseGuardedGroupReturn {
  const { reasonFallback, reasonId, reasonMode = "hidden", scope } = params;
  const resolveState = useCallback(
    (isBlocked: boolean) => resolveGuardedGroupState(isBlocked),
    [],
  );

  const control = useGuardedControl({
    reasonFallback,
    reasonId,
    reasonMode,
    resolveReason: resolveActionReason,
    resolveState,
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
