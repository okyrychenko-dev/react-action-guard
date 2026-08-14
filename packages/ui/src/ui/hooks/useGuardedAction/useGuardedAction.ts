import { useCallback } from "react";
import { resolveActionReason, resolveGuardedActionState } from "../../utils";
import { useGuardedControl } from "../useGuardedControl";
import type { GuardedActionState } from "../../types";
import type {
  UseGuardedActionParams,
  UseGuardedActionReturn,
} from "./useGuardedAction.types";

interface UseMappedGuardedActionParams<
  TActionState,
> extends UseGuardedActionParams<TActionState> {
  getActionState: (state: GuardedActionState) => TActionState;
}

export function useGuardedAction(
  params?: UseGuardedActionParams,
): UseGuardedActionReturn;
export function useGuardedAction<TActionState>(
  params: UseMappedGuardedActionParams<TActionState>,
): UseGuardedActionReturn<TActionState>;
export function useGuardedAction<TActionState>(
  params: UseGuardedActionParams<TActionState>,
): UseGuardedActionReturn<GuardedActionState | TActionState>;
export function useGuardedAction<TActionState>(
  params: UseGuardedActionParams<TActionState> = {},
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

  const resolveState = useCallback(
    (isBlocked: boolean) =>
      resolveGuardedActionState({
        blockedState,
        disabled,
        isBlocked,
        loading,
      }),
    [blockedState, disabled, loading],
  );

  const control = useGuardedControl({
    getControlState: getActionState,
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
    actionState: control.controlState,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
