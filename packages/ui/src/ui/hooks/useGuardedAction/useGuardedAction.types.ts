import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedReasonProps,
  GuardedScopeProps,
  UseTopBlockerReturn,
} from "../../types";

export interface UseGuardedActionParams<TActionState = GuardedActionState>
  extends GuardedScopeProps, GuardedReasonProps {
  blockedState?: GuardedActionBlockedState;
  disabled?: boolean;
  loading?: boolean;
  getActionState?: (state: GuardedActionState) => TActionState;
}

export interface UseGuardedActionReturn<TActionState = GuardedActionState> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  actionState: TActionState;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
