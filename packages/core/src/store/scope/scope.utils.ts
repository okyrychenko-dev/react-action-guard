import {
  type Optional,
  isDefined,
  isNonEmptyArray,
  isReadonlyArray,
  isString,
  isUndefined,
} from "@okyrychenko-dev/type-utils";
import { DEFAULT_SCOPE } from "./scope.constants";
import type { Scope } from "./scope.types";

const normalizedScopeCache = new Map<string, ReadonlyArray<string>>();
const NORMALIZED_SCOPE_CACHE_MAX_SIZE = 256;

function getNormalizedScopeCacheKey(scopes: ReadonlyArray<string>): string {
  return JSON.stringify(scopes);
}

function refreshNormalizedScopeCacheEntry(
  cacheKey: string,
  scopes: ReadonlyArray<string>
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

function getCachedNormalizedScope(scopes: ReadonlyArray<string>): ReadonlyArray<string> {
  const normalizedScope = [...new Set(scopes)].sort();
  const cacheKey = getNormalizedScopeCacheKey(normalizedScope);
  const cachedScope = normalizedScopeCache.get(cacheKey);

  if (isDefined(cachedScope)) {
    return refreshNormalizedScopeCacheEntry(cacheKey, cachedScope);
  }

  normalizedScopeCache.set(cacheKey, normalizedScope);

  if (normalizedScopeCache.size > NORMALIZED_SCOPE_CACHE_MAX_SIZE) {
    evictOldestNormalizedScopeCacheEntry();
  }

  return normalizedScope;
}

/**
 * Returns a stable, deduplicated, sorted scope list.
 * An omitted scope means global; an empty list remains empty.
 */
export function normalizeScope(scope?: Scope): ReadonlyArray<string> {
  if (isUndefined(scope)) {
    return getCachedNormalizedScope([DEFAULT_SCOPE]);
  }

  if (isString(scope)) {
    return getCachedNormalizedScope([scope]);
  }

  return getCachedNormalizedScope(scope);
}

/**
 * Resolves guarded-control inheritance.
 * An omitted or empty explicit scope inherits; any non-empty explicit scope wins.
 */
export function resolveScope(explicitScope?: Scope, inheritedScope?: Scope): Optional<Scope> {
  if (
    isUndefined(explicitScope) ||
    (isReadonlyArray(explicitScope) && !isNonEmptyArray(explicitScope))
  ) {
    return inheritedScope;
  }

  return explicitScope;
}

/**
 * Checks ordinary observation semantics.
 * A global blocker affects every observed scope and otherwise any shared scope is a match.
 */
export function scopeAffectsObservation(blockerScope: Scope, observedScope: Scope): boolean {
  const observedScopes = normalizeScope(observedScope);

  if (!isNonEmptyArray(observedScopes)) {
    return false;
  }

  const blockerScopes = normalizeScope(blockerScope);

  if (blockerScopes.includes(DEFAULT_SCOPE)) {
    return true;
  }

  return observedScopes.some((scope) => blockerScopes.includes(scope));
}

/**
 * Checks targeted-clear semantics.
 * Global blockers never match a target, including the global target; otherwise any shared scope
 * is a match.
 */
export function scopeMatchesTarget(blockerScope: Scope, targetScope: Scope): boolean {
  const blockerScopes = normalizeScope(blockerScope);

  if (blockerScopes.includes(DEFAULT_SCOPE)) {
    return false;
  }

  const targetScopes = normalizeScope(targetScope);

  return targetScopes.some((scope) => blockerScopes.includes(scope));
}
