import { GUIDED_PRESETS } from "../components/GuidedPresets";
import { useGuidedPresets } from "../hooks/useGuidedPresets";
import { DashboardSessionContext } from "./dashboardSession.context";
import { useSessionMetrics } from "./useSessionMetrics";
import type { ReactElement, ReactNode } from "react";

interface DashboardSessionProviderProps {
  children: ReactNode;
}

export function DashboardSessionProvider(props: DashboardSessionProviderProps): ReactElement {
  const { children } = props;

  const metrics = useSessionMetrics();
  const presets = useGuidedPresets({ presets: GUIDED_PRESETS });

  return <DashboardSessionContext value={{ metrics, presets }}>{children}</DashboardSessionContext>;
}
