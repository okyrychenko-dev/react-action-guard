import type {
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

/**
 * Configuration for infinite query blocking with dynamic reasons.
 * Supports different messages for pending, fetching, and error states.
 */
export interface InfiniteQueryBlockingConfig extends BaseBlockingConfig {
  /**
   * Whether to block during the initial pending state (default: true).
   * Set to false to skip blocking during the first data fetch.
   */
  onLoading?: boolean;
  /**
   * Whether to block during background fetching or loading next/previous pages (default: false).
   * Set to true to block when refetching data or loading more pages.
   */
  onFetching?: boolean;
  /**
   * Whether to block on error (default: false).
   * Set to true to keep UI blocked when query fails.
   */
  onError?: boolean;
  /**
   * Message to show during the initial pending state.
   * Falls back to `reason` if not specified.
   */
  reasonOnLoading?: string;
  /**
   * Message to show during background fetching or loading next/previous pages.
   * Falls back to `reason` if not specified.
   */
  reasonOnFetching?: string;
  /**
   * Message to show when query fails.
   * Falls back to `reason` if not specified.
   */
  reasonOnError?: string;
}

/**
 * Options for useBlockingInfiniteQuery hook.
 * Extends TanStack Query's UseInfiniteQueryOptions with blocking configuration.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 * @typeParam TPageParam - The type of the page parameter
 */
export interface UseBlockingInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> {
  /**
   * Configuration for UI blocking behavior
   */
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
