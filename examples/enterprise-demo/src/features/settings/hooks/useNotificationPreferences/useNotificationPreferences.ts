import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { delay } from "@shared/utils";
import { useState } from "react";
import { INITIAL_NOTIFICATION_PREFERENCES } from "./useNotificationPreferences.constants";
import type { UseNotificationPreferencesReturn } from "./useNotificationPreferences.types";

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [emailDigest, setEmailDigest] = useState(INITIAL_NOTIFICATION_PREFERENCES.emailDigest);
  const [smsAlerts, setSmsAlerts] = useState(INITIAL_NOTIFICATION_PREFERENCES.smsAlerts);
  const [slackWebhook, setSlackWebhook] = useState(INITIAL_NOTIFICATION_PREFERENCES.slackWebhook);

  const mutation = useBlockingMutation({
    mutationKey: ["settings", "notification-preferences"],
    mutationFn: async () => {
      await delay(800);
    },
    blockingConfig: {
      scope: "global",
      reasonOnPending: "Saving notification preferences...",
      priority: 35,
    },
  });

  return {
    emailDigest,
    smsAlerts,
    slackWebhook,
    setEmailDigest,
    setSmsAlerts,
    setSlackWebhook,
    saveChanges: () => {
      mutation.mutate();
    },
  };
}
