import { useBlockingQuery } from "@okyrychenko-dev/react-action-guard-tanstack";
import { fetchInventorySnapshot } from "../../integrations.api";
import { integrationKeys } from "../../integrations.keys";
import type { UseQueryResult } from "@tanstack/react-query";
import type { InventoryData } from "../../integrations.types";

export function useInventorySync(): UseQueryResult<InventoryData> {
  return useBlockingQuery<InventoryData>({
    queryKey: integrationKeys.inventorySnapshot(),
    queryFn: ({ signal }) => fetchInventorySnapshot(signal),
    refetchInterval: 30000,
    blockingConfig: {
      scope: "inventory",
      reasonOnLoading: "Loading inventory...",
      onFetching: true,
      reasonOnFetching: "Refreshing inventory...",
    },
  });
}
