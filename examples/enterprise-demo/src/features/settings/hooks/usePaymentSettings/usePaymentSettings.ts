import { useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { delay } from "@shared/utils";
import { useState } from "react";
import { INITIAL_PAYMENT_SETTINGS } from "./usePaymentSettings.constants";
import type { UsePaymentSettingsReturn } from "./usePaymentSettings.types";

export function usePaymentSettings(): UsePaymentSettingsReturn {
  const [gatewayUrl, setGatewayUrl] = useState(INITIAL_PAYMENT_SETTINGS.gatewayUrl);
  const [apiKey, setApiKey] = useState(INITIAL_PAYMENT_SETTINGS.apiKey);

  const isBlocked = useEnterpriseIsBlocked("payment");
  const mutation = useBlockingMutation({
    mutationKey: ["settings", "payment"],
    mutationFn: async () => {
      await delay(800);
    },
    blockingConfig: {
      scope: "payment",
      reasonOnPending: "Saving payment settings...",
      priority: 45,
    },
  });

  return {
    gatewayUrl,
    apiKey,
    statusLabel: isBlocked ? "Guarded" : "Open",
    statusColor: isBlocked ? "warning" : "success",
    setGatewayUrl,
    setApiKey,
    saveChanges: () => {
      mutation.mutate();
    },
  };
}
