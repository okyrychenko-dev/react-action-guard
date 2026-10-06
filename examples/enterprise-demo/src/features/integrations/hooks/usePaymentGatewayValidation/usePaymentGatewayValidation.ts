import { useBlockingQuery } from "@okyrychenko-dev/react-action-guard-tanstack";
import { validatePaymentGateway } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GatewayData } from "../../integrations.types";

export function usePaymentGatewayValidation(): UseQueryResult<GatewayData> {
  const query = useBlockingQuery<GatewayData>({
    queryKey: integrationKeys.paymentGatewayHealth(),
    queryFn: ({ signal }) => validatePaymentGateway(signal),
    enabled: false,
    blockingConfig: {
      scope: "payment",
      priority: 10,
      onFetching: true,
      reasonOnLoading: "Checking gateway...",
      reasonOnFetching: "Rechecking gateway...",
    },
  });

  return query;
}
