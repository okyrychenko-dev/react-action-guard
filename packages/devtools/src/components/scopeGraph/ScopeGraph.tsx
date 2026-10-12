import styles from "./ScopeGraph.module.css";
import { getInspectedScopes } from "./ScopeGraph.utils";
import ScopeGraphDiagram from "./ScopeGraphDiagram";
import type { ReactElement } from "react";
import type { ScopeGraphProps } from "./ScopeGraph.types";

function ScopeGraph(props: ScopeGraphProps): ReactElement {
  const { blockers, inspection } = props;
  const scopes = getInspectedScopes(props);

  return (
    <section className={styles.section} aria-label="Scope relationships">
      <h3>Scope protection</h3>
      <p>
        Lines connect blockers to affected scopes. Global blockers affect every non-empty scope;
        other matches use exact names. Dotted names do not imply parents.
      </p>
      <ScopeGraphDiagram blockers={blockers} scopes={scopes} />
      <table className={styles.table} aria-label="Scope protection">
        <thead>
          <tr>
            <th scope="col">Scope</th>
            <th scope="col">Status</th>
            <th scope="col">Blockers</th>
            <th scope="col">Declared actions</th>
          </tr>
        </thead>
        <tbody>
          {scopes.map(({ scope, blockers: matchingBlockers, actions }) => (
            <tr key={scope}>
              <th scope="row">{scope}</th>
              <td>{matchingBlockers.length > 0 ? "Blocked" : "Unaffected"}</td>
              <td>{matchingBlockers.map(({ id }) => id).join(", ") || "None"}</td>
              <td>{actions.join(", ") || "None"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scopes.length === 0 && <p>No scopes declared or present in active blockers.</p>}
      {!inspection?.actions && (
        <p>Actions are not declared. Scope protection does not prove an action was attempted.</p>
      )}
    </section>
  );
}

export default ScopeGraph;
