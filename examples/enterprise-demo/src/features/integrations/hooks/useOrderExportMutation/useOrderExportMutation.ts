import { publishActionRejected } from "@features/core/sessionEvents";
import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import { useRef } from "react";
import { exportOrdersToErp } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import { ORDER_EXPORT_SCOPES } from "../integrationMutation.constants";
import type { UseMutationResult } from "@tanstack/react-query";
import type { OrderExportResponse } from "../../integrations.types";
import type { IntegrationMutationTrigger } from "../integrationMutation.types";

export function useOrderExportMutation(): UseMutationResult<OrderExportResponse, Error, void> &
  IntegrationMutationTrigger {
  const store = useResolvedStoreApi();
  const runningRef = useRef(false);
  const { buttonState } = useGuardedButton({ scope: ORDER_EXPORT_SCOPES });
  const mutation = useBlockingMutation<OrderExportResponse>({
    mutationKey: integrationKeys.orderExport(),
    mutationFn: () => exportOrdersToErp(),
    onSettled: () => {
      runningRef.current = false;
    },
    blockingConfig: {
      scope: ORDER_EXPORT_SCOPES,
      reasonOnPending: "Exporting orders to ERP...",
      priority: 60,
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
      if (isBlocked(ORDER_EXPORT_SCOPES)) {
        publishActionRejected(store, "blocked");
        return;
      }
      runningRef.current = true;
      mutation.mutate();
    },
  };
}
