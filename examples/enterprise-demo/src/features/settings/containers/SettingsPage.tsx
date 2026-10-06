import { PageHeader } from "@shared/components";
import { CompanyProfileSection } from "./CompanyProfileSection";
import { NotificationPreferencesSection } from "./NotificationPreferencesSection";
import { PaymentSettingsSection } from "./PaymentSettingsSection";
import type { ReactElement } from "react";

export function SettingsPage(): ReactElement {
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Form fields and save actions automatically lock when their scope is blocked — no prop-drilling required."
      />

      <CompanyProfileSection />
      <PaymentSettingsSection />
      <NotificationPreferencesSection />
    </div>
  );
}
