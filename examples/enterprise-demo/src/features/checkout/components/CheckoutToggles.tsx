import { Fieldset, Label, Switch } from "@heroui/react";
import type { ReactElement } from "react";

interface CheckoutTogglesProps {
  riskHold: boolean;
  inventoryMissing: boolean;
  isOperationalLockActive: boolean;
  isGatewaySlow: boolean;
  shouldFailNextPayment: boolean;
  onRiskHoldChange: (value: boolean) => void;
  onInventoryMissingChange: (value: boolean) => void;
  onOpsLockChange: (value: boolean) => void;
  onGatewaySlowChange: (value: boolean) => void;
  onFailNextPaymentChange: (value: boolean) => void;
}

export function CheckoutToggles(props: CheckoutTogglesProps): ReactElement {
  const {
    riskHold,
    inventoryMissing,
    isOperationalLockActive,
    isGatewaySlow,
    shouldFailNextPayment,
    onRiskHoldChange,
    onInventoryMissingChange,
    onOpsLockChange,
    onGatewaySlowChange,
    onFailNextPaymentChange,
  } = props;

  return (
    <Fieldset className="rounded-lg border border-slate-900/8 bg-slate-50 p-3">
      <Fieldset.Legend className="sr-only">Checkout scenario toggles</Fieldset.Legend>
      <Fieldset.Group className="flex flex-wrap gap-4">
        <Switch isSelected={riskHold} onChange={onRiskHoldChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Risk hold</Label>
          </Switch.Content>
        </Switch>
        <Switch isSelected={inventoryMissing} onChange={onInventoryMissingChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Inventory missing</Label>
          </Switch.Content>
        </Switch>
        <Switch isSelected={isOperationalLockActive} onChange={onOpsLockChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Operations lock</Label>
          </Switch.Content>
        </Switch>
        <Switch isSelected={isGatewaySlow} onChange={onGatewaySlowChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Slow gateway</Label>
          </Switch.Content>
        </Switch>
        <Switch isSelected={shouldFailNextPayment} onChange={onFailNextPaymentChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Fail next payment</Label>
          </Switch.Content>
        </Switch>
      </Fieldset.Group>
    </Fieldset>
  );
}
