import type {
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

export interface InfiniteQueryBlockingConfig extends BaseBlockingConfig {
  onLoading?: boolean;
  onFetching?: boolean;
  onError?: boolean;
  reasonOnLoading?: string;
  reasonOnFetching?: string;
  reasonOnError?: string;
}

export interface UseBlockingInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> {
  blockingConfig: InfiniteQueryBlockingConfig;
}

interface BlockingInfiniteQueryConfig {
  blockingConfig: InfiniteQueryBlockingConfig;
}

export type UndefinedInitialDataBlockingInfiniteQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> &
  BlockingInfiniteQueryConfig;

export type DefinedInitialDataBlockingInfiniteQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> &
  BlockingInfiniteQueryConfig;
