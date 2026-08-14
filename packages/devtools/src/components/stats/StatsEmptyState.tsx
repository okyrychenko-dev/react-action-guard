import { ReactElement } from "react";
import { EmptyState } from "../shared";
import styles from "./StatsEmptyState.module.css";

function StatsEmptyState(): ReactElement {
  return (
    <EmptyState>
      <p className={styles.emptyTitle}>No statistics yet</p>
      <p className={styles.emptySubtext}>Stats appear once blocking events are recorded.</p>
    </EmptyState>
  );
}

export default StatsEmptyState;
