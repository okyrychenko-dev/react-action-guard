import { normalizeScope, scopeAffectsObservation } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import type { InspectedScope, ScopeGraphEdge, ScopeGraphProps } from "./ScopeGraph.types";

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

export function getScopeGraphEdges(
  blockers: ScopeGraphProps["blockers"],
  scopes: ReadonlyArray<InspectedScope>
): ReadonlyArray<ScopeGraphEdge> {
  const blockerIndices = new Map<string, number>();
  const edges: Array<ScopeGraphEdge> = [];

  for (const [index, { id }] of blockers.entries()) {
    blockerIndices.set(id, index);
  }

  for (const [scopeIndex, { scope, blockers: matchingBlockers }] of scopes.entries()) {
    for (const { id: blockerId } of matchingBlockers) {
      const blockerIndex = blockerIndices.get(blockerId);

      if (isDefined(blockerIndex)) {
        edges.push({ blockerId, scope, blockerIndex, scopeIndex });
      }
    }
  }

  return edges;
}

export function formatDiagramLabel(label: string): string {
  return label.length > 20 ? `${label.slice(0, 17)}…` : label;
}
