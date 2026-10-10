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
  const normalizedScope = Object.freeze([...new Set(scopes)].sort());
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
 * Returns a frozen, stable, deduplicated, sorted scope list.
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

function matchesObservedScopes(
  blockerScope: Scope,
  observedScopes: ReadonlyArray<string>
): boolean {
  if (!isNonEmptyArray(observedScopes)) {
    return false;
  }

  if (isString(blockerScope)) {
    return blockerScope === DEFAULT_SCOPE || observedScopes.includes(blockerScope);
  }

  return (
    blockerScope.includes(DEFAULT_SCOPE) ||
    observedScopes.some((scope) => blockerScope.includes(scope))
  );
}

/**
 * Checks ordinary observation semantics.
 * A global blocker affects every observed scope and otherwise any shared scope is a match.
 */
export function scopeAffectsObservation(blockerScope: Scope, observedScope: Scope): boolean {
  return matchesObservedScopes(blockerScope, normalizeScope(observedScope));
}

/** @internal Prepare one observation without repeatedly normalizing every blocker. */
export function createScopeObservationMatcher(
  observedScope: Scope
): (blockerScope: Scope) => boolean {
  const observedScopes = normalizeScope(observedScope);

  return (blockerScope) => matchesObservedScopes(blockerScope, observedScopes);
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
