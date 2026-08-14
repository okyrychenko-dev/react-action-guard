import { useGuardedAction } from "../useGuardedAction";
import type { GuardedActionState } from "../../types";
import type {
  UseGuardedButtonParams,
  UseGuardedButtonReturn,
} from "./useGuardedButton.types";

interface UseMappedGuardedButtonParams<
  TButtonState,
> extends UseGuardedButtonParams<TButtonState> {
  getButtonState: (state: GuardedActionState) => TButtonState;
}

export function useGuardedButton(
  params?: UseGuardedButtonParams,
): UseGuardedButtonReturn;
export function useGuardedButton<TButtonState>(
  params: UseMappedGuardedButtonParams<TButtonState>,
): UseGuardedButtonReturn<TButtonState>;
export function useGuardedButton<TButtonState>(
  params: UseGuardedButtonParams<TButtonState> = {},
): UseGuardedButtonReturn<GuardedActionState | TButtonState> {
  const {
    blockedState = "disabled",
    disabled,
    getButtonState,
    loading,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;

  const action = useGuardedAction({
    blockedState,
    disabled,
    getActionState: getButtonState,
    loading,
    reasonFallback,
    reasonId,
    reasonMode,
    scope,
  });

  return {
    blocker: action.blocker,
    isBlocked: action.isBlocked,
    buttonState: action.actionState,
    reasonContent: action.reasonContent,
    ariaDescribedBy: action.ariaDescribedBy,
  };
}
