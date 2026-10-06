import { publishActionRejected } from "@features/core/sessionEvents";
import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import { useRef } from "react";
import { pushPriceUpdate } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import { PRICE_UPDATE_SCOPES } from "../integrationMutation.constants";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PriceUpdateResponse } from "../../integrations.types";
import type { IntegrationMutationTrigger } from "../integrationMutation.types";

export function usePriceUpdateMutation(): UseMutationResult<PriceUpdateResponse, Error, void> &
  IntegrationMutationTrigger {
  const store = useResolvedStoreApi();
  const runningRef = useRef(false);
  const { buttonState } = useGuardedButton({ scope: PRICE_UPDATE_SCOPES });
  const mutation = useBlockingMutation<PriceUpdateResponse>({
    mutationKey: integrationKeys.priceCatalogPush(),
    mutationFn: () => pushPriceUpdate(),
    onSettled: () => {
      runningRef.current = false;
    },
    blockingConfig: {
      scope: PRICE_UPDATE_SCOPES,
      reasonOnPending: "Pushing price update...",
      priority: 50,
    },
  });
  return {
    ...mutation,
    isDisabled: mutation.isPending || buttonState.disabled,
    startMutation: () => {
      const { isBlocked } = store.getState();
      if (runningRef.current) {
        publishActionRejected(store, "duplicate");
        return;
      }
      if (isBlocked(PRICE_UPDATE_SCOPES)) {
        publishActionRejected(store, "blocked");
        return;
      }
      runningRef.current = true;
      mutation.mutate();
    },
  };
}
