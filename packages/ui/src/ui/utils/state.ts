import { normalizeScope } from "@okyrychenko-dev/react-action-guard";
import { type Optional, assertNever } from "@okyrychenko-dev/type-utils";
import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedFieldBlockedState,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
  GuardedScope,
} from "../types";

function mergeWithBlockedFlag(value: Optional<boolean>, isBlocked: boolean): boolean {
  return (value ?? false) || isBlocked;
}

function trueOrUndefined(value: boolean): Optional<true> {
  if (value) {
    return true;
  }

  return undefined;
}

function blockedLinkTabIndex(isDisabled: boolean, removeFromTabOrder?: boolean): -1 | undefined {
  if (isDisabled && removeFromTabOrder === true) {
    return -1;
  }

  return undefined;
}

export function normalizeGuardedScope(scope?: GuardedScope): ReadonlyArray<string> {
  return normalizeScope(scope);
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
  const isDisabled = params.disabled === true || params.isBlocked;

  return {
    ariaDisabled: trueOrUndefined(isDisabled),
    tabIndex: blockedLinkTabIndex(isDisabled, params.removeFromTabOrder),
    onClickShouldPrevent: isDisabled,
  };
}

export function resolveGuardedGroupState(isBlocked: boolean): GuardedGroupState {
  return {
    ariaBusy: trueOrUndefined(isBlocked),
    ariaDisabled: trueOrUndefined(isBlocked),
  };
}
