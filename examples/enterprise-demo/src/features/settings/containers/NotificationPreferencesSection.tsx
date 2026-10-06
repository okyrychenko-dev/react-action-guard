import { Button, Card, Chip, Input, Label, Separator, Switch } from "@heroui/react";
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
        <Chip color={preferences.isDisabled ? "warning" : "success"} variant="soft" size="sm">
          {preferences.isDisabled ? "Locked" : "Open"}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Switch
            isDisabled={preferences.isDisabled}
            isSelected={preferences.emailDigest}
            onChange={preferences.setEmailDigest}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>Email digest</Label>
            </Switch.Content>
          </Switch>
          <Switch
            isDisabled={preferences.isDisabled}
            isSelected={preferences.smsAlerts}
            onChange={preferences.setSmsAlerts}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>SMS alerts</Label>
            </Switch.Content>
          </Switch>
          <Separator />
          <label className="flex flex-col gap-1.5 text-slate-700 text-[13px] font-medium">
            Slack webhook URL
            <Input
              disabled={preferences.isDisabled}
              value={preferences.slackWebhook}
              onChange={handleSlackWebhookChange}
              aria-label="Slack webhook URL"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            isDisabled={preferences.isDisabled}
            variant="primary"
            onPress={preferences.saveChanges}
          >
            {preferences.isPending ? "Saving changes…" : "Save changes"}
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}
