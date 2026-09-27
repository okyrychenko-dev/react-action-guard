import { type QueriesResults, type QueryClient, useQueries } from "@tanstack/react-query";
import { useBlockingCoordination } from "../internal";
import type { BlockingQueriesInput, QueriesBlockingConfig } from "./useBlockingQueries.types";

/** Wraps TanStack Queries with one shared UI blocker. */
export function useBlockingQueries<T extends Array<unknown>>(
  queries: BlockingQueriesInput<T>,
  blockingConfig: QueriesBlockingConfig,
  queryClient?: QueryClient
): QueriesResults<T> {
  const results = useQueries(
    {
      queries,
    },
    queryClient
  );

  useBlockingCoordination({
    kind: "queries",
    state: {
      loading: results.some((result) => result.isPending),
      fetching: results.some((result) => result.isRefetching),
      error: results.some((result) => result.isError),
    },
    config: blockingConfig,
    defaultReason: "Loading queries...",
    defaultPriority: 10,
  });

  return results;
}
