import type {
  DefaultError,
  DefinedInitialDataOptions,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

export interface QueryBlockingConfig extends BaseBlockingConfig {
  onLoading?: boolean;
  onFetching?: boolean;
  onError?: boolean;
  reasonOnLoading?: string;
  reasonOnFetching?: string;
  reasonOnError?: string;
}

export interface UseBlockingQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  blockingConfig: QueryBlockingConfig;
}

interface BlockingQueryConfig {
  blockingConfig: QueryBlockingConfig;
}

export type UndefinedInitialDataBlockingQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & BlockingQueryConfig;

export type DefinedInitialDataBlockingQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & BlockingQueryConfig;
