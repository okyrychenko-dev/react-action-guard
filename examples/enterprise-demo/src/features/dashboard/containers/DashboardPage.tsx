import { Alert } from "@heroui/react";
import { PageHeader } from "@shared/components";
import { GUIDED_PRESETS, GuidedPresets, MetricsCard, ScopeStatusGrid } from "../components";
import { useDashboardMetrics, useGuidedPresets } from "../hooks";
import type { ReactElement } from "react";

export function DashboardPage(): ReactElement {
  const { ordersPlaced, totalGuardEvents, activeBlockerCount } = useDashboardMetrics();
  const { activePresetId, applyPreset, clearPresets } = useGuidedPresets({
    presets: GUIDED_PRESETS,
  });

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Command Center"
        title="System Overview"
        description="Live view of all active blockers, guard events, and scope health across the enterprise checkout pipeline."
      />

      <div className="grid grid-cols-4 gap-3.5">
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

      <Alert status="accent">
        <Alert.Content>
          <Alert.Title>Try the demo</Alert.Title>
          <Alert.Description>
            <ol className="m-0 pl-4 leading-7 flex flex-col gap-1">
              <li>
                Go to <strong>Checkout</strong>, edit the address field — the navigation scope
                locks.
              </li>
              <li>Click any sidebar link to see the navigation-guard modal intercept you.</li>
              <li>
                In <strong>Admin</strong>, arm a maintenance window or simulate a team member lock.
              </li>
              <li>Watch the Guard Inspector on the right update in real time.</li>
            </ol>
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
