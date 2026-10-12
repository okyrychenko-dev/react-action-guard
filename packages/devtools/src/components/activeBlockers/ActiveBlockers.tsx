import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { isNonEmptyArray } from "@okyrychenko-dev/type-utils";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { ScopeGraph } from "../scopeGraph";
import { DEFAULT_STUCK_THRESHOLD_MS, STUCK_TICK_INTERVAL_MS } from "./ActiveBlockers.constants";
import styles from "./ActiveBlockers.module.css";
import { getSortedBlockers } from "./ActiveBlockers.utils";
import ActiveBlockersEmptyState from "./ActiveBlockersEmptyState";
import ActiveBlockersList from "./ActiveBlockersList";
import type { DevtoolsInspection, UIBlockingStoreApi } from "../actionGuardDevtools";

interface ActiveBlockersProps {
  store?: UIBlockingStoreApi;
  inspection?: DevtoolsInspection;
  /** Age (ms) after which a blocker is flagged as stuck (default: 10000). */
  stuckThresholdMs?: number;
}

function ActiveBlockers(props: ActiveBlockersProps): ReactElement {
  const { store, inspection, stuckThresholdMs = DEFAULT_STUCK_THRESHOLD_MS } = props;

  // Single subscription - use provided store or fall back to global
  const targetStore = store ?? uiBlockingStoreApi;
  const blockingSnapshot = useStore(targetStore, (state) => state.blockingSnapshot);

  const blockers = useMemo(() => getSortedBlockers(blockingSnapshot), [blockingSnapshot]);
  const hasBlockers = isNonEmptyArray(blockers);

  // Tick while blockers are present so ages (and the stuck flag) stay fresh.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasBlockers) {
      return;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, STUCK_TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasBlockers, blockers.length]);

  let blockerContent = <ActiveBlockersEmptyState />;

  if (hasBlockers) {
    blockerContent = (
      <ActiveBlockersList
        blockers={blockers}
        now={now}
        stuckThresholdMs={stuckThresholdMs}
        inspection={inspection}
      />
    );
  }

  return (
    <section className={styles.inspection} aria-label="Active blocker inspection" tabIndex={0}>
      {blockerContent}
      <ScopeGraph blockers={blockingSnapshot} inspection={inspection} />
    </section>
  );
}

export default ActiveBlockers;
