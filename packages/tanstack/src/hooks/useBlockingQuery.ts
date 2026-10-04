import {
  type DefaultError,
  type DefinedUseQueryResult,
  type NoInfer,
  type QueryClient,
  type QueryKey,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useBlockingCoordination } from "../internal";
import type {
  DefinedInitialDataBlockingQueryOptions,
  UndefinedInitialDataBlockingQueryOptions,
  UseBlockingQueryOptions,
} from "./useBlockingQuery.types";

/** Wraps TanStack Query with UI blocking. */
export function useBlockingQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataBlockingQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): DefinedUseQueryResult<NoInfer<TData>, TError>;

export function useBlockingQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataBlockingQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<TData>, TError>;

export function useBlockingQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseBlockingQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<TData>, TError> {
  const { blockingConfig, ...queryOptions } = options;
  const query = useQuery(queryOptions, queryClient);

  useBlockingCoordination({
    kind: "query",
    key: options.queryKey,
    state: { loading: query.isLoading, fetching: query.isRefetching, error: query.isError },
    config: blockingConfig,
    defaultReason: "Loading data...",
    defaultPriority: 10,
  });

  return query;
}
