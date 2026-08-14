import { ReactElement } from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard(props: StatCardProps): ReactElement {
  const { label, value } = props;

  return (
    <div className={styles.card}>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardLabel}>{label}</span>
    </div>
  );
}

export default StatCard;
