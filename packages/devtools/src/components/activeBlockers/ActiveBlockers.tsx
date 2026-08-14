import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { DEFAULT_STUCK_THRESHOLD_MS, STUCK_TICK_INTERVAL_MS } from "./ActiveBlockers.constants";
import { getSortedBlockers } from "./ActiveBlockers.utils";
import ActiveBlockersEmptyState from "./ActiveBlockersEmptyState";
import ActiveBlockersList from "./ActiveBlockersList";
import type { UIBlockingStoreApi } from "../actionGuardDevtools";

interface ActiveBlockersProps {
  store?: UIBlockingStoreApi;
  /** Age (ms) after which a blocker is flagged as stuck (default: 10000). */
  stuckThresholdMs?: number;
}

function ActiveBlockers(props: ActiveBlockersProps): ReactElement {
  const { store, stuckThresholdMs = DEFAULT_STUCK_THRESHOLD_MS } = props;

  // Single subscription - use provided store or fall back to global
  const targetStore = store ?? uiBlockingStoreApi;
  const activeBlockers = useStore(targetStore, (state) => state.activeBlockers);

  const blockers = useMemo(() => getSortedBlockers(activeBlockers), [activeBlockers]);

  // Tick while blockers are present so ages (and the stuck flag) stay fresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (blockers.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, STUCK_TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [blockers.length]);

  if (blockers.length === 0) {
    return <ActiveBlockersEmptyState />;
  }

  return <ActiveBlockersList blockers={blockers} now={now} stuckThresholdMs={stuckThresholdMs} />;
}

export default ActiveBlockers;
