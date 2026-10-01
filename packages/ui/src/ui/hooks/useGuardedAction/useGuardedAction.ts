import { useGuardedControl } from "../useGuardedControl";
import type { GuardedActionState } from "../../types";
import type { UseGuardedActionParams, UseGuardedActionReturn } from "./useGuardedAction.types";

interface UseMappedGuardedActionParams<TActionState> extends UseGuardedActionParams<TActionState> {
  getActionState: (state: GuardedActionState) => TActionState;
}

export function useGuardedAction(params?: UseGuardedActionParams): UseGuardedActionReturn;
export function useGuardedAction<TActionState>(
  params: UseMappedGuardedActionParams<TActionState>
): UseGuardedActionReturn<TActionState>;
export function useGuardedAction<TActionState>(
  params: UseGuardedActionParams<TActionState>
): UseGuardedActionReturn<GuardedActionState | TActionState>;
export function useGuardedAction<TActionState>(
  params: UseGuardedActionParams<TActionState> = {}
): UseGuardedActionReturn<GuardedActionState | TActionState> {
  const {
    blockedState = "disabled",
    disabled,
    getActionState,
    loading,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;

  const control = useGuardedControl({
    kind: "action",
    blockedState,
    disabled,
    loading,
    getControlState: getActionState,
    reasonFallback,
    reasonId,
    reasonMode,
    scope,
  });

  return {
    blocker: control.blocker,
    isBlocked: control.isBlocked,
    actionState: control.controlState,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
