import type {
  GuardedFieldBlockedState,
  GuardedFieldReasonProps,
  GuardedFieldState,
  GuardedScopeProps,
  UseTopBlockerReturn,
} from "../../types";

export interface UseGuardedFieldParams<TFieldState = GuardedFieldState>
  extends GuardedScopeProps, GuardedFieldReasonProps {
  blockedState?: GuardedFieldBlockedState;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  getFieldState?: (state: GuardedFieldState) => TFieldState;
}

export interface UseGuardedFieldReturn<TFieldState = GuardedFieldState> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  fieldState: TFieldState;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
