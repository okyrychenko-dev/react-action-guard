import { DEFAULT_SCOPE, normalizeScope } from "@okyrychenko-dev/react-action-guard";
import { isNonEmptyArray } from "@okyrychenko-dev/type-utils";
import { useId } from "react";
import styles from "./ScopeGraph.module.css";
import { formatDiagramLabel, getScopeGraphEdges } from "./ScopeGraph.utils";
import type { ReactElement } from "react";
import type { InspectedScope, ScopeGraphProps } from "./ScopeGraph.types";

interface ScopeGraphDiagramProps {
  blockers: ScopeGraphProps["blockers"];
  scopes: ReadonlyArray<InspectedScope>;
}

function ScopeGraphDiagram({ blockers, scopes }: ScopeGraphDiagramProps): ReactElement {
  const height = Math.max(blockers.length, scopes.length, 1) * 36 + 28;
  const edges = getScopeGraphEdges(blockers, scopes);
  const descriptionId = useId();
  const description =
    edges.map(({ blockerId, scope }) => `${blockerId} blocks ${scope}`).join(". ") ||
    "No blocking relationships.";

  return (
    <svg
      role="img"
      aria-label="Blockers and affected scopes"
      aria-describedby={descriptionId}
      viewBox={`0 0 380 ${String(height)}`}
      className={styles.diagram}
    >
      <title>Blockers and affected scopes</title>
      <desc id={descriptionId}>{description}</desc>
      <text x="4" y="14">
        Blockers
      </text>
      <text x="234" y="14">
        Scopes
      </text>
      {edges.map(({ blockerId, scope, blockerIndex, scopeIndex }) => (
        <line
          key={JSON.stringify([blockerId, scope])}
          x1="146"
          y1={blockerIndex * 36 + 40}
          x2="230"
          y2={scopeIndex * 36 + 40}
        />
      ))}
      {blockers.map(({ id, scope }, index) => {
        const isGlobal = normalizeScope(scope).includes(DEFAULT_SCOPE);
        const label = isGlobal ? `${id} (global)` : id;

        return (
          <g key={id}>
            <title>{label}</title>
            <rect x="0" y={index * 36 + 24} width="146" height="28" rx="4" />
            <text x="4" y={index * 36 + 43}>
              {formatDiagramLabel(label)}
            </text>
          </g>
        );
      })}
      {scopes.map(({ scope, blockers: matchingBlockers }, index) => {
        const status = isNonEmptyArray(matchingBlockers) ? "Blocked" : "Unaffected";

        return (
          <g
            key={scope}
            className={isNonEmptyArray(matchingBlockers) ? styles.blocked : styles.unaffected}
          >
            <title>
              {scope}: {status}
            </title>
            <rect x="230" y={index * 36 + 24} width="146" height="28" rx="4" />
            <text x="234" y={index * 36 + 43}>
              {formatDiagramLabel(scope)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default ScopeGraphDiagram;
