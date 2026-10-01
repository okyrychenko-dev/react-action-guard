import { type Optional, assertNever, isNull, isUndefined } from "@okyrychenko-dev/type-utils";
import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedFieldBlockedState,
  GuardedFieldReasonMode,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
  GuardedReasonMode,
  GuardedReasonResult,
} from "../../types";
import type {
  GuardedControlReasonOptions,
  GuardedControlState,
  UseGuardedControlParams,
} from "./useGuardedControl.types";
function mergeWithBlockedFlag(value: Optional<boolean>, isBlocked: boolean): boolean {
  return (value ?? false) || isBlocked;
}

function trueOrUndefined(value: boolean): Optional<true> {
  if (value) {
    return true;
  }

  return undefined;
}

function blockedLinkTabIndex(isDisabled: boolean, removeFromTabOrder?: boolean): Optional<-1> {
  if (isDisabled && removeFromTabOrder === true) {
    return -1;
  }

  return undefined;
}

export function resolveGuardedActionState(params: {
  blockedState: GuardedActionBlockedState;
  isBlocked: boolean;
  disabled?: boolean;
  loading?: boolean;
}): GuardedActionState {
  const { blockedState, disabled, isBlocked, loading } = params;

  switch (blockedState) {
    case "disabled": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);

      return {
        disabled: resolvedDisabled,
        loading: loading === true,
        ariaBusy: undefined,
        ariaDisabled: trueOrUndefined(resolvedDisabled),
      };
    }
    case "loading": {
      const resolvedLoading = mergeWithBlockedFlag(loading, isBlocked);
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);

      return {
        disabled: resolvedDisabled,
        loading: resolvedLoading,
        ariaBusy: trueOrUndefined(resolvedLoading),
        ariaDisabled: trueOrUndefined(resolvedDisabled),
      };
    }
    case "none":
      return {
        disabled: disabled === true,
        loading: loading === true,
        ariaBusy: trueOrUndefined(loading === true),
        ariaDisabled: trueOrUndefined(disabled === true),
      };
    default:
      return assertNever(blockedState, "GuardedActionBlockedState");
  }
}

export function resolveGuardedFieldState(params: {
  blockedState: GuardedFieldBlockedState;
  isBlocked: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
}): GuardedFieldState {
  const { blockedState, disabled, isBlocked, loading, readOnly } = params;

  switch (blockedState) {
    case "disabled": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);

      return {
        disabled: resolvedDisabled,
        readOnly: readOnly === true,
        loading: loading === true,
        ariaBusy: trueOrUndefined(loading === true),
        ariaDisabled: trueOrUndefined(resolvedDisabled),
        ariaReadOnly: trueOrUndefined(readOnly === true),
      };
    }
    case "readOnly": {
      const resolvedReadOnly = mergeWithBlockedFlag(readOnly, isBlocked);

      return {
        disabled: disabled === true,
        readOnly: resolvedReadOnly,
        loading: loading === true,
        ariaBusy: trueOrUndefined(loading === true),
        ariaDisabled: trueOrUndefined(disabled === true),
        ariaReadOnly: trueOrUndefined(resolvedReadOnly),
      };
    }
    case "loading": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);
      const resolvedLoading = mergeWithBlockedFlag(loading, isBlocked);

      return {
        disabled: resolvedDisabled,
        readOnly: readOnly === true,
        loading: resolvedLoading,
        ariaBusy: trueOrUndefined(resolvedLoading),
        ariaDisabled: trueOrUndefined(resolvedDisabled),
        ariaReadOnly: trueOrUndefined(readOnly === true),
      };
    }
    case "none":
      return {
        disabled: disabled === true,
        readOnly: readOnly === true,
        loading: loading === true,
        ariaBusy: trueOrUndefined(loading === true),
        ariaDisabled: trueOrUndefined(disabled === true),
        ariaReadOnly: trueOrUndefined(readOnly === true),
      };
    default:
      return assertNever(blockedState, "GuardedFieldBlockedState");
  }
}

export function resolveGuardedLinkState(params: {
  isBlocked: boolean;
  disabled?: boolean;
  removeFromTabOrder?: boolean;
}): GuardedLinkState {
  const { disabled, isBlocked, removeFromTabOrder } = params;

  const isDisabled = disabled === true || isBlocked;

  return {
    ariaDisabled: trueOrUndefined(isDisabled),
    tabIndex: blockedLinkTabIndex(isDisabled, removeFromTabOrder),
    onClickShouldPrevent: isDisabled,
  };
}

export function resolveGuardedGroupState(isBlocked: boolean): GuardedGroupState {
  return {
    ariaBusy: trueOrUndefined(isBlocked),
    ariaDisabled: trueOrUndefined(isBlocked),
  };
}
function shouldLinkReason(mode: GuardedReasonMode | GuardedFieldReasonMode): boolean {
  return mode === "description" || mode === "helperText";
}

function getRequiredReasonId(
  mode: GuardedReasonMode | GuardedFieldReasonMode,
  reasonId?: string
): string {
  if (isUndefined(reasonId) || reasonId.trim().length === 0) {
    throw new Error(`reasonId is required when reasonMode is "${mode}"`);
  }

  return reasonId;
}

export function resolveControlReason(params: GuardedControlReasonOptions): GuardedReasonResult {
  const { blocker, fallback, mode, reasonId } = params;

  const reason = blocker.reason ?? fallback ?? null;

  if (!blocker.isBlocked || isNull(reason) || mode === "hidden") {
    return { ariaDescribedBy: undefined, reasonContent: null };
  }

  if (shouldLinkReason(mode)) {
    return {
      ariaDescribedBy: getRequiredReasonId(mode, reasonId),
      reasonContent: reason,
    };
  }

  return { ariaDescribedBy: undefined, reasonContent: reason };
}

export function interpretControlState<TState>(
  params: UseGuardedControlParams<TState>,
  isBlocked: boolean
): GuardedControlState | TState {
  switch (params.kind) {
    case "action": {
      const { blockedState = "disabled", disabled, loading, getControlState } = params;
      const state = resolveGuardedActionState({ blockedState, disabled, loading, isBlocked });

      return getControlState ? getControlState(state) : state;
    }
    case "field": {
      const { blockedState = "disabled", disabled, loading, readOnly, getControlState } = params;
      const state = resolveGuardedFieldState({
        blockedState,
        disabled,
        loading,
        readOnly,
        isBlocked,
      });

      return getControlState ? getControlState(state) : state;
    }
    case "group":
      return resolveGuardedGroupState(isBlocked);
    case "link":
      return resolveGuardedLinkState({ ...params, isBlocked });
    default:
      return assertNever(params, "GuardedControl");
  }
}
