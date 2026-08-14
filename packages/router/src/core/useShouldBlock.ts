import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useMemo, useRef } from "react";
import { isDefined, normalizeScope, resolveCondition } from "./utils";

/**
 * Shared hook to determine if blocking should be active based on
 * condition and/or scope state.
 *
 * This hook uses `useMemo` for optimal performance, ensuring blocking state
 * is computed synchronously without additional re-renders.
 *
 * @param when - Optional condition (boolean or function)
 * @param scope - Optional scope(s) to check
 * @returns Whether blocking should be active
 *
 * @internal
 */
export function useShouldBlock(
  when?: boolean | (() => boolean),
  scope?: string | Array<string>
): boolean {
  // Memoize scope normalization to avoid recalculation on every render
  const scopes = useMemo(() => normalizeScope(scope), [scope]);

  // Check if any specified scopes are blocked
  const isScopeBlocked = useIsBlocked(scopes.length === 1 ? scopes[0] : scopes);

  // Development-only validation
  const warnedMissingConditionRef = useRef(false);
  const warnedFunctionRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (!warnedMissingConditionRef.current && !isDefined(when) && !scope) {
      warnedMissingConditionRef.current = true;
      console.warn(
        '[react-action-guard-router] useShouldBlock: Neither "when" nor "scope" provided. ' +
          "This hook will always return false. Please provide at least one condition."
      );
    }

    if (!warnedFunctionRef.current && typeof when === "function") {
      warnedFunctionRef.current = true;
      console.warn(
        '[react-action-guard-router] useShouldBlock: "when" is a function. ' +
          "Make sure to wrap it with useCallback to avoid unnecessary re-computations."
      );
    }
  }, [when, scope]);

  // Compute blocking state synchronously using useMemo
  // This avoids the useState + useEffect pattern which causes an extra render
  const shouldBlock = useMemo(() => {
    let blockCondition = false;

    // Check manual condition
    if (isDefined(when)) {
      blockCondition = resolveCondition(when);
    }

    // Check scope-based blocking (OR logic - block if either condition is true)
    if (scope && isScopeBlocked) {
      blockCondition = true;
    }

    return blockCondition;
  }, [when, scope, isScopeBlocked]);

  return shouldBlock;
}
