export interface NotificationPreferencesState {
  emailDigest: boolean;
  smsAlerts: boolean;
  slackWebhook: string;
}

export interface UseNotificationPreferencesReturn extends NotificationPreferencesState {
  setEmailDigest: (value: boolean) => void;
  setSmsAlerts: (value: boolean) => void;
  setSlackWebhook: (value: string) => void;
  saveChanges: VoidFunction;
}
