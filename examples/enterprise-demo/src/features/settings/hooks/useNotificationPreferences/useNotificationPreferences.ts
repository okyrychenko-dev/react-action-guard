import { publishActionRejected } from "@features/core/sessionEvents";
import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import { delay } from "@shared/utils";
import { useRef, useState } from "react";
import { INITIAL_NOTIFICATION_PREFERENCES } from "./useNotificationPreferences.constants";
import type { UseNotificationPreferencesReturn } from "./useNotificationPreferences.types";

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const store = useResolvedStoreApi();
  const savingRef = useRef(false);
  const { buttonState } = useGuardedButton({ scope: "global" });
  const [emailDigest, setEmailDigest] = useState(INITIAL_NOTIFICATION_PREFERENCES.emailDigest);
  const [smsAlerts, setSmsAlerts] = useState(INITIAL_NOTIFICATION_PREFERENCES.smsAlerts);
  const [slackWebhook, setSlackWebhook] = useState(INITIAL_NOTIFICATION_PREFERENCES.slackWebhook);

  const mutation = useBlockingMutation({
    mutationKey: ["settings", "notification-preferences"],
    mutationFn: async () => {
      await delay(800);
    },
    onSettled: () => {
      savingRef.current = false;
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
    isPending: mutation.isPending,
    isDisabled: mutation.isPending || buttonState.disabled,
    setEmailDigest,
    setSmsAlerts,
    setSlackWebhook,
    saveChanges: () => {
      const { isBlocked } = store.getState();
      if (savingRef.current) {
        publishActionRejected(store, "duplicate");
        return;
      }
      if (isBlocked("global")) {
        publishActionRejected(store, "blocked");
        return;
      }
      savingRef.current = true;
      mutation.mutate();
    },
  };
}
