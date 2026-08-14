import type {
  GuardedGroupState,
  GuardedReasonProps,
  GuardedScopeProps,
  UseTopBlockerReturn,
} from "../../types";

export interface UseGuardedGroupParams
  extends GuardedScopeProps, GuardedReasonProps {}

export interface UseGuardedGroupReturn {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  groupState: GuardedGroupState;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
