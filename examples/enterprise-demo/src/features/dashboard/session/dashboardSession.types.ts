import type { UseDashboardMetricsReturn } from "../hooks/useDashboardMetrics";
import type { UseGuidedPresetsReturn } from "../hooks/useGuidedPresets";

export interface DashboardSession {
  metrics: UseDashboardMetricsReturn;
  presets: UseGuidedPresetsReturn;
}
