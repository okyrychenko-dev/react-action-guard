import { ReactElement } from "react";
import { selectEventStats, useDevtoolsStore } from "../../store";
import { Content } from "../shared";
import styles from "./Stats.module.css";
import StatsByAction from "./StatsByAction";
import StatsEmptyState from "./StatsEmptyState";
import StatsSummary from "./StatsSummary";
import StatsTopScopes from "./StatsTopScopes";

function Stats(): ReactElement {
  const stats = useDevtoolsStore(selectEventStats);

  if (stats.total === 0) {
    return <StatsEmptyState />;
  }

  return (
    <Content className={styles.stats}>
      <StatsSummary
        total={stats.total}
        averageDurationMs={stats.averageDurationMs}
        maxDurationMs={stats.maxDurationMs}
        durationSampleCount={stats.durationSampleCount}
      />
      <StatsByAction byAction={stats.byAction} />
      <StatsTopScopes topScopes={stats.topScopes} />
    </Content>
  );
}

export default Stats;
