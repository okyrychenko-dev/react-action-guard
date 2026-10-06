export interface NotificationPreferencesState {
  emailDigest: boolean;
  smsAlerts: boolean;
  slackWebhook: string;
}

export interface UseNotificationPreferencesReturn extends NotificationPreferencesState {
  isPending: boolean;
  isDisabled: boolean;
  setEmailDigest: (value: boolean) => void;
  setSmsAlerts: (value: boolean) => void;
  setSlackWebhook: (value: string) => void;
  saveChanges: VoidFunction;
}
