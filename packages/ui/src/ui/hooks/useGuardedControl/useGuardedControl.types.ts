import type { Nullable } from "@okyrychenko-dev/type-utils";
import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedFieldBlockedState,
  GuardedFieldReasonMode,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
  GuardedReasonBlocker,
  GuardedReasonMode,
  GuardedScope,
  UseTopBlockerReturn,
} from "../../types";

interface GuardedControlOptions<TMode> {
  scope?: GuardedScope;
  reasonFallback?: string;
  reasonId?: string;
  reasonMode?: TMode;
}
export interface ActionControlOptions<
  TState = GuardedActionState,
> extends GuardedControlOptions<GuardedReasonMode> {
  kind: "action";
  blockedState?: GuardedActionBlockedState;
  disabled?: boolean;
  loading?: boolean;
  getControlState?: (state: GuardedActionState) => TState;
}
export interface FieldControlOptions<
  TState = GuardedFieldState,
> extends GuardedControlOptions<GuardedFieldReasonMode> {
  kind: "field";
  blockedState?: GuardedFieldBlockedState;
  disabled?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  getControlState?: (state: GuardedFieldState) => TState;
}
export interface GroupControlOptions extends GuardedControlOptions<GuardedReasonMode> {
  kind: "group";
}
export interface LinkControlOptions extends GuardedControlOptions<GuardedReasonMode> {
  kind: "link";
  disabled?: boolean;
  removeFromTabOrder?: boolean;
}
export interface GuardedControlOptionsByKind<TState> {
  action: ActionControlOptions<TState>;
  field: FieldControlOptions<TState>;
  group: GroupControlOptions;
  link: LinkControlOptions;
}
export interface GuardedControlReasonOptions {
  blocker: GuardedReasonBlocker;
  fallback?: string;
  mode: GuardedReasonMode | GuardedFieldReasonMode;
  reasonId?: string;
}
export type GuardedControlState =
  GuardedActionState | GuardedFieldState | GuardedGroupState | GuardedLinkState;
export type UseGuardedControlParams<TState> =
  | ActionControlOptions<TState>
  | FieldControlOptions<TState>
  | GroupControlOptions
  | LinkControlOptions;
export interface UseGuardedControlReturn<TState> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  controlState: TState;
  reasonContent: Nullable<string>;
  ariaDescribedBy?: string;
}
