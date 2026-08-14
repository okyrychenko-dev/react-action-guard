import { ReactElement } from "react";
import { EmptyState } from "../shared";
import styles from "./Timeline.module.css";

function TimelineEmptyState(): ReactElement {
  return (
    <EmptyState>
      <p>No events recorded yet.</p>
      <p className={styles.emptyHint}>Events will appear here as blockers are added/removed.</p>
    </EmptyState>
  );
}

export default TimelineEmptyState;
