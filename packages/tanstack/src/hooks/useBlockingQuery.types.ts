import type {
  DefaultError,
  DefinedInitialDataOptions,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

/**
 * Configuration for query blocking with dynamic reasons.
 * Supports different messages for pending, refetching, and error states.
 */
export interface QueryBlockingConfig extends BaseBlockingConfig {
  /**
   * Whether to block during the initial pending state (default: true).
   * Set to false to skip blocking during the first data fetch.
   */
  onLoading?: boolean;
  /**
   * Whether to block during background fetching (default: false).
   * Set to true to block when refetching data in the background.
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
   * Message to show during background refetching.
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
 * Options for useBlockingQuery hook.
 * Extends TanStack Query's UseQueryOptions with blocking configuration.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 */
export interface UseBlockingQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  /**
   * Configuration for UI blocking behavior during query execution.
   */
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
