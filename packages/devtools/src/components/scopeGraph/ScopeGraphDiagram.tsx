import {
  DEFAULT_SCOPE,
  normalizeScope,
  scopeAffectsObservation,
} from "@okyrychenko-dev/react-action-guard";
import styles from "./ScopeGraph.module.css";
import type { ReactElement } from "react";
import type { InspectedScope, ScopeGraphProps } from "./ScopeGraph.types";

interface ScopeGraphDiagramProps {
  blockers: ScopeGraphProps["blockers"];
  scopes: ReadonlyArray<InspectedScope>;
}

function ScopeGraphDiagram({ blockers, scopes }: ScopeGraphDiagramProps): ReactElement {
  const height = Math.max(blockers.length, scopes.length, 1) * 36 + 28;

  return (
    <svg
      role="img"
      aria-label="Blockers and affected scopes"
      viewBox={`0 0 380 ${String(height)}`}
      className={styles.diagram}
    >
      <title>Blockers and affected scopes</title>
      <text x="4" y="14">
        Blockers
      </text>
      <text x="234" y="14">
        Scopes
      </text>
      {blockers.flatMap((blocker, blockerIndex) =>
        scopes.map(({ scope }, scopeIndex) => {
          if (!scopeAffectsObservation(blocker.scope, scope)) {
            return null;
          }

          return (
            <line
              key={JSON.stringify([blocker.id, scope])}
              x1="146"
              y1={blockerIndex * 36 + 40}
              x2="230"
              y2={scopeIndex * 36 + 40}
            />
          );
        })
      )}
      {blockers.map(({ id, scope }, index) => {
        const isGlobal = normalizeScope(scope).includes(DEFAULT_SCOPE);
        const label = isGlobal ? `${id} (global)` : id;

        return (
          <g key={id}>
            <title>{label}</title>
            <rect x="0" y={index * 36 + 24} width="146" height="28" rx="4" />
            <text x="4" y={index * 36 + 43}>
              {label.length > 20 ? `${label.slice(0, 17)}…` : label}
            </text>
          </g>
        );
      })}
      {scopes.map(({ scope, blockers: matchingBlockers }, index) => {
        const status = matchingBlockers.length > 0 ? "Blocked" : "Unaffected";

        return (
          <g
            key={scope}
            className={matchingBlockers.length > 0 ? styles.blocked : styles.unaffected}
          >
            <title>
              {scope}: {status}
            </title>
            <rect x="230" y={index * 36 + 24} width="146" height="28" rx="4" />
            <text x="234" y={index * 36 + 43}>
              {scope.length > 20 ? `${scope.slice(0, 17)}…` : scope}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default ScopeGraphDiagram;
