import { ReactElement } from "react";
import { formatDuration } from "../../utils";
import StatCard from "./StatCard";
import styles from "./StatsSummary.module.css";

interface StatsSummaryProps {
  total: number;
  averageDurationMs: number;
  maxDurationMs: number;
  durationSampleCount: number;
}

function StatsSummary(props: StatsSummaryProps): ReactElement {
  const { total, averageDurationMs, maxDurationMs, durationSampleCount } = props;

  const hasDurations = durationSampleCount > 0;

  return (
    <div className={styles.summaryGrid}>
      <StatCard label="Total events" value={String(total)} />
      <StatCard
        label="Avg duration"
        value={hasDurations ? formatDuration(Math.round(averageDurationMs)) : "—"}
      />
      <StatCard label="Max duration" value={hasDurations ? formatDuration(maxDurationMs) : "—"} />
    </div>
  );
}

export default StatsSummary;
