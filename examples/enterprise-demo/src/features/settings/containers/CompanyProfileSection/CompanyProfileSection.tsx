import { Card, Chip } from "@heroui/react";
import { GuardedFormScopeProvider } from "@okyrychenko-dev/react-action-guard-ui";
import { SectionTitle } from "@shared/components";
import { GuardedInputField, SectionNote } from "../../components";
import { useCompanyProfileForm } from "../../hooks";
import { SaveButton } from "./SaveButton";
import type { ReactElement } from "react";

export function CompanyProfileSection(): ReactElement {
  const form = useCompanyProfileForm();

  return (
    <Card>
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Settings" title="Company Profile" />
        <Chip color={form.statusColor} variant="soft" size="sm">
          {form.statusLabel}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <GuardedFormScopeProvider scope="checkout">
          <div className="grid grid-cols-2 gap-3">
            <GuardedInputField
              label="Company name"
              value={form.companyName}
              onChange={form.setCompanyName}
            />
            <GuardedInputField label="Tax ID" value={form.taxId} onChange={form.setTaxId} />
            <GuardedInputField
              label="Business address"
              value={form.businessAddress}
              onChange={form.setBusinessAddress}
            />
          </div>
          <SectionNote>
            These fields are guarded by the checkout scope. Trigger a checkout blocker to see them
            lock automatically.
          </SectionNote>
          <div className="flex justify-end">
            <SaveButton onSave={form.saveChanges} />
          </div>
        </GuardedFormScopeProvider>
      </Card.Content>
    </Card>
  );
}
