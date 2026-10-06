import { Card, Chip } from "@heroui/react";
import { GuardedFormScopeProvider } from "@okyrychenko-dev/react-action-guard-ui";
import { SectionTitle } from "@shared/components";
import { GuardedInputField, SectionNote } from "../../components";
import { usePaymentSettings } from "../../hooks";
import { SaveButton } from "./SaveButton";
import type { ReactElement } from "react";

export function PaymentSettingsSection(): ReactElement {
  const settings = usePaymentSettings();

  return (
    <Card>
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Settings" title="Payment Settings" />
        <Chip color={settings.statusColor} variant="soft" size="sm">
          {settings.statusLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <GuardedFormScopeProvider scope="payment">
          <div className="grid grid-cols-2 gap-3">
            <GuardedInputField
              label="Payment gateway URL"
              value={settings.gatewayUrl}
              onChange={settings.setGatewayUrl}
            />
            <GuardedInputField
              label="API key"
              value={settings.apiKey}
              onChange={settings.setApiKey}
              type="password"
            />
          </div>
          <SectionNote>
            Payment fields lock when the payment scope is blocked — preventing accidental edits
            during active transactions.
          </SectionNote>
          <div className="flex justify-end">
            <SaveButton onSave={settings.saveChanges} />
          </div>
        </GuardedFormScopeProvider>
      </Card.Content>
    </Card>
  );
}
