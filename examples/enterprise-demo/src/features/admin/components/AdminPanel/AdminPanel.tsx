import { Button, Card, Chip, Label, Separator, Switch } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { restrictionChip } from "./AdminPanel.utils";
import type { ReactElement } from "react";

interface AdminPanelProps {
  isRestricted: boolean;
  actionResult: string;
  isMaintenanceArmed: boolean;
  isTeamLockActive: boolean;
  refundDisabled: boolean;
  onRefund: VoidFunction;
  onClearCheckout: VoidFunction;
  onClearAll: VoidFunction;
  onMaintenanceToggle: (value: boolean) => void;
  onSimulateTeamMember: VoidFunction;
}

export function AdminPanel(props: AdminPanelProps): ReactElement {
  const {
    isRestricted,
    actionResult,
    isMaintenanceArmed,
    isTeamLockActive,
    refundDisabled,
    onRefund,
    onClearCheckout,
    onClearAll,
    onMaintenanceToggle,
    onSimulateTeamMember,
  } = props;

  const chip = restrictionChip(isRestricted);

  return (
    <Card>
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Admin operations" title="Risk and maintenance controls" />
        <Chip color={chip.color} variant="soft">
          {chip.label}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          <Button variant="danger-soft" onPress={onRefund} isDisabled={refundDisabled}>
            Refund order
          </Button>
          <Button variant="secondary" onPress={onClearCheckout}>
            Clear checkout scope
          </Button>
          <Button variant="secondary" onPress={onClearAll}>
            Clear all blockers
          </Button>
        </div>

        <Separator />

        <div>
          <Button variant="secondary" onPress={onSimulateTeamMember} isDisabled={isTeamLockActive}>
            {isTeamLockActive ? "Team lock active…" : "Simulate team member lock"}
          </Button>
          <p className="m-0 mt-2 text-slate-500 text-[13px]">
            Adds a competing blocker on checkout + payment scopes for 8 seconds, simulating a
            concurrent user review lock.
          </p>
        </div>

        <Separator />

        <div>
          <Switch isSelected={isMaintenanceArmed} onChange={onMaintenanceToggle}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>Arm 1s maintenance window</Label>
            </Switch.Content>
          </Switch>
          <p className="m-0 mt-2 text-slate-500 text-[13px]">
            Scheduled maintenance demonstrates time-based global blocking with automatic cleanup.
          </p>
        </div>

        {actionResult && <p className="m-0 text-slate-500 text-[13px]">{actionResult}</p>}
      </Card.Content>
    </Card>
  );
}
