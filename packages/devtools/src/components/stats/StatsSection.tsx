import { ReactElement, ReactNode } from "react";
import styles from "./StatsSection.module.css";

interface StatsSectionProps {
  title: string;
  rows: ReadonlyArray<{ id: string; label: ReactNode; count: number }>;
  emptyMessage?: string;
}

function StatsSection(props: StatsSectionProps): ReactElement {
  const { title, rows, emptyMessage = "No data." } = props;

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {rows.length === 0 && <p className={styles.muted}>{emptyMessage}</p>}
      {rows.length > 0 && (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li key={row.id} className={styles.row}>
              <span className={styles.label}>{row.label}</span>
              <span className={styles.count}>{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default StatsSection;
