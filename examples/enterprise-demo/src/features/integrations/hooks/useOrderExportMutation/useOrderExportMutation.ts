import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { exportOrdersToErp } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import type { UseMutationResult } from "@tanstack/react-query";
import type { OrderExportResponse } from "../../integrations.types";

export function useOrderExportMutation(): UseMutationResult<OrderExportResponse, Error, void> {
  return useBlockingMutation<OrderExportResponse>({
    mutationKey: integrationKeys.orderExport(),
    mutationFn: () => exportOrdersToErp(),
    blockingConfig: {
      scope: ["checkout"],
      reasonOnPending: "Exporting orders to ERP...",
      priority: 60,
    },
  });
}
