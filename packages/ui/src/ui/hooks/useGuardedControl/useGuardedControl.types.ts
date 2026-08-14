import type {
  GuardedFieldReasonMode,
  GuardedReasonBlocker,
  GuardedReasonMode,
  GuardedReasonResult,
  GuardedScope,
  UseTopBlockerReturn,
} from "../../types";

export type ResolveGuardedControlState<TBaseState> = (
  isBlocked: boolean,
) => TBaseState;

export type ResolveGuardedControlReason<
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode,
> = (params: {
  blocker: GuardedReasonBlocker;
  fallback?: string;
  mode: TReasonMode;
  reasonId?: string;
}) => GuardedReasonResult;

export interface UseGuardedControlParams<
  TBaseState,
  TControlState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode,
> {
  scope?: GuardedScope;
  resolveState: ResolveGuardedControlState<TBaseState>;
  getControlState?: (state: TBaseState) => TControlState;
  reasonFallback?: string;
  reasonId?: string;
  reasonMode: TReasonMode;
  resolveReason: ResolveGuardedControlReason<TReasonMode>;
}

export type UseUnmappedGuardedControlParams<
  TBaseState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode,
> = Omit<
  UseGuardedControlParams<TBaseState, TBaseState, TReasonMode>,
  "getControlState"
> & {
  getControlState?: undefined;
};

export type UseMappedGuardedControlParams<
  TBaseState,
  TControlState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode,
> = UseGuardedControlParams<TBaseState, TControlState, TReasonMode> & {
  getControlState: (state: TBaseState) => TControlState;
};

export interface UseGuardedControlReturn<TControlState> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  controlState: TControlState;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
