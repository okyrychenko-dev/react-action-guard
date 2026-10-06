import { useBlockingQuery } from "@okyrychenko-dev/react-action-guard-tanstack";
import { fetchOrders } from "../../orders.api";
import { orderKeys } from "../../orders.keys";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Order } from "../../orders.types";

export function useOrders(): UseQueryResult<ReadonlyArray<Order>> {
  return useBlockingQuery<ReadonlyArray<Order>>({
    queryKey: orderKeys.list(),
    queryFn: ({ signal }) => fetchOrders(signal),
    blockingConfig: {
      scope: "checkout",
      reasonOnLoading: "Loading orders...",
    },
  });
}
