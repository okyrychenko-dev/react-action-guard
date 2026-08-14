import { useCallback } from "react";
import { resolveFieldReason, resolveGuardedFieldState } from "../../utils";
import { useGuardedControl } from "../useGuardedControl";
import type { GuardedFieldState } from "../../types";
import type {
  UseGuardedFieldParams,
  UseGuardedFieldReturn,
} from "./useGuardedField.types";

interface UseMappedGuardedFieldParams<
  TFieldState,
> extends UseGuardedFieldParams<TFieldState> {
  getFieldState: (state: GuardedFieldState) => TFieldState;
}

export function useGuardedField(
  params?: UseGuardedFieldParams,
): UseGuardedFieldReturn;
export function useGuardedField<TFieldState>(
  params: UseMappedGuardedFieldParams<TFieldState>,
): UseGuardedFieldReturn<TFieldState>;
export function useGuardedField<TFieldState>(
  params: UseGuardedFieldParams<TFieldState> = {},
): UseGuardedFieldReturn<GuardedFieldState | TFieldState> {
  const {
    blockedState = "disabled",
    disabled,
    getFieldState,
    loading,
    readOnly,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;

  const resolveState = useCallback(
    (isBlocked: boolean) =>
      resolveGuardedFieldState({
        blockedState,
        disabled,
        isBlocked,
        loading,
        readOnly,
      }),
    [blockedState, disabled, loading, readOnly],
  );

  const control = useGuardedControl({
    getControlState: getFieldState,
    reasonFallback,
    reasonId,
    reasonMode,
    resolveReason: resolveFieldReason,
    resolveState,
    scope,
  });

  return {
    blocker: control.blocker,
    isBlocked: control.isBlocked,
    fieldState: control.controlState,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
