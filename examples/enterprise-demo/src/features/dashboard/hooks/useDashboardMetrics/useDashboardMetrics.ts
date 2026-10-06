import { useDashboardSession } from "../../session";
import type { UseDashboardMetricsReturn } from "./useDashboardMetrics.types";

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const { metrics } = useDashboardSession();
  return metrics;
}
