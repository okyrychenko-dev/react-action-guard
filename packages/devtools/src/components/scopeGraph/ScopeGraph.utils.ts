import { normalizeScope, scopeAffectsObservation } from "@okyrychenko-dev/react-action-guard";
import type { InspectedScope, ScopeGraphProps } from "./ScopeGraph.types";

export function getInspectedScopes({
  blockers,
  inspection,
}: ScopeGraphProps): ReadonlyArray<InspectedScope> {
  const scopes = new Set(inspection?.scopes);
  const actions = inspection?.actions ?? [];

  for (const { scope } of [...blockers, ...actions]) {
    for (const name of normalizeScope(scope)) {
      scopes.add(name);
    }
  }

  return [...scopes].sort().map((scope) => ({
    scope,
    blockers: blockers.filter((blocker) => scopeAffectsObservation(blocker.scope, scope)),
    actions: actions
      .filter((action) => normalizeScope(action.scope).includes(scope))
      .map(({ id }) => id),
  }));
}
