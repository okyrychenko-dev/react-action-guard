import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { useEffect, useMemo, useRef } from "react";
import { normalizeScope, resolveCondition } from "./utils";

/**
 * Shared hook to determine if blocking should be active based on
 * condition and/or scope state.
 *
 * Pure function conditions are evaluated synchronously on every render.
 * Mutating a ref alone does not trigger a render.
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
  }, [when, scope]);

  const blockCondition = isDefined(when) && resolveCondition(when);

  return blockCondition || Boolean(scope && isScopeBlocked);
}
