import type {
  DefaultError,
  QueriesOptions,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

export interface QueriesBlockingConfig extends BaseBlockingConfig {
  onLoading?: boolean;
  onFetching?: boolean;
  onError?: boolean;
  reasonOnLoading?: string;
  reasonOnFetching?: string;
  reasonOnError?: string;
}

export type UseBlockingQueriesOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

export type BlockingQueriesInput<T extends Array<unknown>> = readonly [...QueriesOptions<T>];
