import { useMemo } from "react";
import { useResolvedGuardedScope } from "../../context";
import { useTopBlocker } from "../useTopBlocker";
import { interpretControlState, resolveControlReason } from "./useGuardedControl.utils";
import type {
  GuardedActionState,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
} from "../../types";
import type {
  ActionControlOptions,
  FieldControlOptions,
  GroupControlOptions,
  GuardedControlOptionsByKind,
  GuardedControlState,
  LinkControlOptions,
  UseGuardedControlParams,
  UseGuardedControlReturn,
} from "./useGuardedControl.types";

export function useGuardedControl<TState = GuardedActionState>(
  params: ActionControlOptions<TState>
): UseGuardedControlReturn<GuardedActionState | TState>;
export function useGuardedControl<TState = GuardedFieldState>(
  params: FieldControlOptions<TState>
): UseGuardedControlReturn<GuardedFieldState | TState>;
export function useGuardedControl(
  params: GroupControlOptions
): UseGuardedControlReturn<GuardedGroupState>;
export function useGuardedControl(
  params: LinkControlOptions
): UseGuardedControlReturn<GuardedLinkState>;
export function useGuardedControl<TState>(
  params: UseGuardedControlParams<TState>
): UseGuardedControlReturn<GuardedControlState | TState> {
  const { kind, scope, reasonFallback, reasonId, reasonMode = "hidden" } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);
  const { isBlocked, reason: blockerReason } = blocker;
  // Depend on option values, so inline options do not invalidate public state identity.
  const disabled = "disabled" in params ? params.disabled : undefined;
  const loading = "loading" in params ? params.loading : undefined;
  const readOnly = "readOnly" in params ? params.readOnly : undefined;
  const actionBlockedState = kind === "action" ? params.blockedState : undefined;
  const fieldBlockedState = kind === "field" ? params.blockedState : undefined;
  const removeFromTabOrder = kind === "link" ? params.removeFromTabOrder : undefined;
  const actionMapping = kind === "action" ? params.getControlState : undefined;
  const fieldMapping = kind === "field" ? params.getControlState : undefined;

  const optionsByKind = useMemo<GuardedControlOptionsByKind<TState>>(
    () => ({
      action: {
        kind: "action",
        disabled,
        loading,
        blockedState: actionBlockedState,
        getControlState: actionMapping,
      },
      field: {
        kind: "field",
        disabled,
        loading,
        readOnly,
        blockedState: fieldBlockedState,
        getControlState: fieldMapping,
      },
      group: { kind: "group" },
      link: { kind: "link", disabled, removeFromTabOrder },
    }),
    [
      disabled,
      loading,
      readOnly,
      actionBlockedState,
      fieldBlockedState,
      removeFromTabOrder,
      actionMapping,
      fieldMapping,
    ]
  );
  const controlState = useMemo(
    () => interpretControlState<TState>(optionsByKind[kind], isBlocked),
    [optionsByKind, kind, isBlocked]
  );
  const reason = useMemo(
    () =>
      resolveControlReason({
        blocker: { isBlocked, reason: blockerReason },
        mode: reasonMode,
        fallback: reasonFallback,
        reasonId,
      }),
    [isBlocked, blockerReason, reasonMode, reasonFallback, reasonId]
  );

  return useMemo(
    () => ({ blocker, isBlocked, controlState, ...reason }),
    [blocker, isBlocked, controlState, reason]
  );
}
