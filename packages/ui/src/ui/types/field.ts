export type GuardedFieldBlockedState =
  | "disabled"
  | "readOnly"
  | "loading"
  | "none";

export interface GuardedFieldState {
  disabled: boolean;
  readOnly: boolean;
  loading: boolean;
  ariaBusy?: true;
  ariaDisabled?: true;
  ariaReadOnly?: true;
}
