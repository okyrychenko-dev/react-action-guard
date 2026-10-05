import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { pushPriceUpdate } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PriceUpdateResponse } from "../../integrations.types";

export function usePriceUpdateMutation(): UseMutationResult<PriceUpdateResponse, Error, void> {
  return useBlockingMutation<PriceUpdateResponse>({
    mutationKey: integrationKeys.priceCatalogPush(),
    mutationFn: () => pushPriceUpdate(),
    blockingConfig: {
      scope: ["checkout", "payment"],
      reasonOnPending: "Pushing price update...",
      priority: 50,
    },
  });
}
