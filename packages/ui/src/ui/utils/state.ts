import { DEFAULT_GUARDED_SCOPE } from "../constants";
import { assertNever } from "./assert";
import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedFieldBlockedState,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
  GuardedScope,
} from "../types";

const normalizedScopeCache = new Map<string, ReadonlyArray<string>>();
const NORMALIZED_SCOPE_CACHE_MAX_SIZE = 256;

function mergeWithBlockedFlag(
  value: boolean | undefined,
  isBlocked: boolean,
): boolean {
  return (value ?? false) || isBlocked;
}

function trueOrUndefined(value: boolean): true | undefined {
  if (value) {
    return true;
  }

  return undefined;
}

function blockedLinkTabIndex(
  isDisabled: boolean,
  removeFromTabOrder?: boolean,
): -1 | undefined {
  if (isDisabled && removeFromTabOrder === true) {
    return -1;
  }

  return undefined;
}

function getNormalizedScopeCacheKey(scopes: ReadonlyArray<string>): string {
  return JSON.stringify([...scopes].sort());
}

function normalizeScopeList(
  scopes: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return [...new Set(scopes)].sort();
}

function refreshNormalizedScopeCacheEntry(
  cacheKey: string,
  scopes: ReadonlyArray<string>,
): ReadonlyArray<string> {
  normalizedScopeCache.delete(cacheKey);
  normalizedScopeCache.set(cacheKey, scopes);
  return scopes;
}

function evictOldestNormalizedScopeCacheEntry(): void {
  for (const cacheKey of normalizedScopeCache.keys()) {
    normalizedScopeCache.delete(cacheKey);
    break;
  }
}

function getCachedNormalizedScope(
  scopes: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const cacheKey = getNormalizedScopeCacheKey(scopes);
  const cachedScope = normalizedScopeCache.get(cacheKey);

  if (cachedScope !== undefined) {
    return refreshNormalizedScopeCacheEntry(cacheKey, cachedScope);
  }

  const normalizedScope = normalizeScopeList(scopes);

  normalizedScopeCache.set(cacheKey, normalizedScope);

  if (normalizedScopeCache.size > NORMALIZED_SCOPE_CACHE_MAX_SIZE) {
    evictOldestNormalizedScopeCacheEntry();
  }

  return normalizedScope;
}

export function normalizeGuardedScope(
  scope?: GuardedScope,
): ReadonlyArray<string> {
  if (scope === undefined) {
    return getCachedNormalizedScope([DEFAULT_GUARDED_SCOPE]);
  }

  if (typeof scope === "string") {
    return getCachedNormalizedScope([scope]);
  }

  return getCachedNormalizedScope(scope);
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

export function resolveGuardedGroupState(
  isBlocked: boolean,
): GuardedGroupState {
  return {
    ariaBusy: trueOrUndefined(isBlocked),
    ariaDisabled: trueOrUndefined(isBlocked),
  };
}
