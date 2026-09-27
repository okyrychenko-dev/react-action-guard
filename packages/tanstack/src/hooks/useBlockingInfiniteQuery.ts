import {
  type DefaultError,
  type DefinedUseInfiniteQueryResult,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useBlockingCoordination } from "../internal";
import type {
  DefinedInitialDataBlockingInfiniteQueryOptions,
  UndefinedInitialDataBlockingInfiniteQueryOptions,
  UseBlockingInfiniteQueryOptions,
} from "./useBlockingInfiniteQuery.types";

/** Wraps TanStack Infinite Query with UI blocking. */
export function useBlockingInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataBlockingInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient
): DefinedUseInfiniteQueryResult<TData, TError>;

export function useBlockingInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataBlockingInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient
): UseInfiniteQueryResult<TData, TError>;

export function useBlockingInfiniteQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseBlockingInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  queryClient?: QueryClient
): UseInfiniteQueryResult<TData, TError> {
  const { blockingConfig, ...queryOptions } = options;
  const query = useInfiniteQuery(queryOptions, queryClient);

  useBlockingCoordination({
    kind: "infinite-query",
    key: options.queryKey,
    state: {
      loading: query.isPending,
      fetching: query.isRefetching || query.isFetchingNextPage || query.isFetchingPreviousPage,
      error: query.isError,
    },
    config: blockingConfig,
    defaultReason: "Loading more data...",
    defaultPriority: 10,
  });

  return query;
}
