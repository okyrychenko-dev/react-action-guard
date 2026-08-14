export type GuardedActionBlockedState = "disabled" | "loading" | "none";

export interface GuardedActionState {
  disabled: boolean;
  loading: boolean;
  ariaBusy?: true;
  ariaDisabled?: true;
}
