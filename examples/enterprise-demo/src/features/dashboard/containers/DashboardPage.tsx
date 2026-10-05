import { PageHeader } from "@shared/components";
import { DemoGuide, GuidedPresets, MetricsCard, ScopeStatusGrid } from "../components";
import { useDashboardMetrics } from "../hooks";
import { useDashboardSession } from "../session";
import type { ReactElement } from "react";

export function DashboardPage(): ReactElement {
  const { ordersPlaced, totalGuardEvents, activeBlockerCount } = useDashboardMetrics();
  const { presets } = useDashboardSession();
  const { activePresetId, applyPreset, clearPresets } = presets;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Interactive playground"
        title="See action guards at work"
        description="Try a real workflow, see which actions are protected, and follow each blocker in the live inspector."
      />

      <DemoGuide />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
        <MetricsCard
          label="Orders placed"
          value={ordersPlaced}
          description="Completed this session"
        />
        <MetricsCard
          label="Guard events"
          value={totalGuardEvents}
          description="Middleware activations"
        />
        <MetricsCard
          label="Active blockers"
          value={activeBlockerCount}
          description="Currently registered"
        />
        <MetricsCard label="Scopes protected" value={6} description="Checkout pipeline scopes" />
      </div>

      <GuidedPresets
        activePresetId={activePresetId}
        onApplyPreset={applyPreset}
        onClearPresets={clearPresets}
      />

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="m-0 mb-1 text-slate-900 text-[17px] font-semibold">Scope health</h2>
          <p className="m-0 text-slate-500 text-sm leading-relaxed">
            Each scope is monitored in real time. Navigate to Checkout or Admin to trigger blockers
            and watch them pulse below.
          </p>
        </div>
        <ScopeStatusGrid />
      </div>
    </div>
  );
}
