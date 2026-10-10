import { useMemo } from "react";
import { useResolvedValue } from "../../context";
import { DEFAULT_SCOPE, normalizeScope } from "../../store";
import { areBlockingInfosEqual, createBlockingInfoSelector } from "../../store/blockingInfo";
import type { BlockerInfo } from "../../store";
import type { Scope } from "../../store/scope";

/**
 * Gets immutable, priority-ordered information about blockers affecting the observed scopes.
 * Unrelated lifecycle changes preserve the result and do not trigger a render.
 *
 * @public
 * @since 0.6.0
 * @see {@link useIsBlocked} for a simple boolean check
 * @see {@link useActionBlocker} to create blockers
 * @see {@link BlockerInfo} for the structure of blocker information objects
 */
export function useBlockingInfo(
  scope: Scope = DEFAULT_SCOPE
): ReadonlyArray<Readonly<BlockerInfo>> {
  const checkedScopes = normalizeScope(scope);

  const selector = useMemo(() => {
    return createBlockingInfoSelector(checkedScopes);
  }, [checkedScopes]);

  return useResolvedValue(selector, areBlockingInfosEqual);
}
