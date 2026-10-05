import { Button, Card, Chip, Input, Separator, Switch } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { useNotificationPreferences } from "../hooks";
import type { ReactElement } from "react";

export function NotificationPreferencesSection(): ReactElement {
  const preferences = useNotificationPreferences();

  const handleSlackWebhookChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    preferences.setSlackWebhook(event.target.value);
  };

  return (
    <Card>
      <Card.Header className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow="Settings" title="Notification Preferences" />
        <Chip color="success" variant="soft" size="sm">
          Open
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Switch isSelected={preferences.emailDigest} onChange={preferences.setEmailDigest}>
            Email digest
          </Switch>
          <Switch isSelected={preferences.smsAlerts} onChange={preferences.setSmsAlerts}>
            SMS alerts
          </Switch>
          <Separator />
          <label className="flex flex-col gap-1.5 text-slate-700 text-[13px] font-medium">
            Slack webhook URL
            <Input
              value={preferences.slackWebhook}
              onChange={handleSlackWebhookChange}
              aria-label="Slack webhook URL"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onPress={preferences.saveChanges}>
            Save changes
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}
