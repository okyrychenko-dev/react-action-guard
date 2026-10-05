import type { NotificationPreferencesState } from "./useNotificationPreferences.types";

export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferencesState = {
  emailDigest: true,
  smsAlerts: false,
  slackWebhook: "https://hooks.slack.com/services/T00/B00/xxx",
};
