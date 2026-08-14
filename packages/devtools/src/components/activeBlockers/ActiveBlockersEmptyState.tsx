import { ReactElement } from "react";
import { BlockIcon } from "../../icons";
import { COLORS } from "../../styles/tokens";
import { EmptyState } from "../shared";
import styles from "./ActiveBlockers.module.css";

function ActiveBlockersEmptyState(): ReactElement {
  return (
    <EmptyState>
      <span className={styles.emptyIcon}>
        <BlockIcon size={32} color={COLORS.textDim} />
      </span>
      <p className={styles.emptyTitle}>No active blockers</p>
      <p className={styles.emptySubtext}>The UI is currently unblocked.</p>
    </EmptyState>
  );
}

export default ActiveBlockersEmptyState;
