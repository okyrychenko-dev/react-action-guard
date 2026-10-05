import { subscribeToOrderPlaced } from "@features/core/sessionEvents";
import { useResolvedStoreApi, useResolvedValue } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useState } from "react";
import type { UseDashboardMetricsReturn } from "../hooks/useDashboardMetrics/useDashboardMetrics.types";

export function useSessionMetrics(): UseDashboardMetricsReturn {
  const store = useResolvedStoreApi();
  const [ordersPlaced, setOrdersPlaced] = useState(0);
  const [totalGuardEvents, setTotalGuardEvents] = useState(0);

  const { activeBlockerCount } = useResolvedValue((s) => ({
    activeBlockerCount: s.blockingSnapshot.length,
  }));

  useEffect(() => {
    const { observeBlockingEvents } = store.getState();
    return observeBlockingEvents(() => {
      setTotalGuardEvents((n) => n + 1);
    });
  }, [store]);

  useEffect(() => {
    return subscribeToOrderPlaced(store, () => {
      setOrdersPlaced((n) => n + 1);
    });
  }, [store]);

  return { ordersPlaced, totalGuardEvents, activeBlockerCount };
}
