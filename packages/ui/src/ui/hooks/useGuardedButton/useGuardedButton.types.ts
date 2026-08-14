import type { GuardedActionState } from "../../types";
import type {
  UseGuardedActionParams,
  UseGuardedActionReturn,
} from "../useGuardedAction";

export interface UseGuardedButtonParams<
  TButtonState = GuardedActionState,
> extends Omit<UseGuardedActionParams<TButtonState>, "getActionState"> {
  getButtonState?: (state: GuardedActionState) => TButtonState;
}

export type UseGuardedButtonReturn<TButtonState = GuardedActionState> = Omit<
  UseGuardedActionReturn<TButtonState>,
  "actionState"
> & {
  buttonState: TButtonState;
};
