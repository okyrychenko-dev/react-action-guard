import {
  type DefaultError,
  type DefinedUseInfiniteQueryResult,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useBlockingManager, useQueryBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
import type {
  DefinedInitialDataBlockingInfiniteQueryOptions,
  UndefinedInitialDataBlockingInfiniteQueryOptions,
  UseBlockingInfiniteQueryOptions,
} from "./useBlockingInfiniteQuery.types";

/**
 * A drop-in replacement for TanStack Query's `useInfiniteQuery` with automatic UI blocking.
 *
 * This hook wraps TanStack Query's `useInfiniteQuery` for infinite scrolling/pagination scenarios
 * with automatic UI blocking. It handles blocking during initial page load and optionally during
 * loading of additional pages (next/previous).
 *
 * By default, only blocks during initial data load (`isPending`), not when fetching more pages.
 * This allows users to continue interacting with already-loaded content while more loads in the background.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown (default: Error)
 * @typeParam TData - The type of data returned by the hook (default: TQueryFnData)
 * @typeParam TQueryKey - The type of the query key (default: QueryKey)
 * @typeParam TPageParam - The type of the page parameter (default: unknown)
 *
 * @param options - Combined TanStack Query infinite query options and blocking configuration
 * @param options.queryKey - Unique key for the query
 * @param options.queryFn - Function that fetches a page of data
 * @param options.getNextPageParam - Function to get the next page param
 * @param options.getPreviousPageParam - Function to get the previous page param (optional)
 * @param options.initialPageParam - Initial page parameter value
 * @param options.blockingConfig - Configuration for UI blocking behavior
 * @param options.blockingConfig.scope - Scope(s) to block (default: 'global')
 * @param options.blockingConfig.reason - Default blocking reason (default: 'Loading more data...')
 * @param options.blockingConfig.reasonOnLoading - Reason during initial load
 * @param options.blockingConfig.reasonOnFetching - Reason during page fetching
 * @param options.blockingConfig.reasonOnError - Reason during error state
 * @param options.blockingConfig.priority - Priority level 0-100 (default: 10)
 * @param options.blockingConfig.timeout - Auto-remove blocker after N milliseconds
 * @param options.blockingConfig.onTimeout - Callback when timeout occurs
 * @param options.blockingConfig.onLoading - Block during initial pending state (default: true)
 * @param options.blockingConfig.onFetching - Block during page fetching (default: false)
 * @param options.blockingConfig.onError - Block during error state (default: false)
 *
 * @returns Infinite query result object from TanStack Query
 *
 * @example
 * Visual feedback - distinguish initial load vs "load more"
 * ```ts
 * import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * function InfinitePostFeed() {
 *   const query = useBlockingInfiniteQuery({
 *     queryKey: ['posts'],
 *     queryFn: ({ pageParam }) => fetchPosts(pageParam),
 *     getNextPageParam: (lastPage) => lastPage.nextCursor,
 *     initialPageParam: 0,
 *     blockingConfig: {
 *       scope: 'posts-feed',
 *       reasonOnLoading: 'Loading posts...',
 *       reasonOnFetching: 'Loading more...',
 *       onLoading: true,   // Block initial load
 *       onFetching: false, // Don't block "load more" ✅
 *     }
 *   });
 *
 *   const blockers = useBlockingInfo('posts-feed');
 *   const isInitialLoad = blockers.length > 0;
 *
 *   if (isInitialLoad) {
 *     // blockers[0].reason === "Loading posts..."
 *     // Show full-page skeleton
 *     return null;
 *   }
 *
 *   // Background pagination:
 *   // - blockers.length === 0
 *   // - query.isFetchingNextPage === true
 *   // Show inline "Load more..." button instead of blocking
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Block all pages - critical data loading
 * ```ts
 * import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';
 *
 * function AuditLogViewer() {
 *   const query = useBlockingInfiniteQuery({
 *     queryKey: ['audit-logs'],
 *     queryFn: ({ pageParam }) => fetchAuditLogs(pageParam),
 *     getNextPageParam: (lastPage) => lastPage.nextPage,
 *     initialPageParam: 1,
 *     blockingConfig: {
 *       scope: 'audit-logs',
 *       reasonOnLoading: 'Loading audit logs...',
 *       reasonOnFetching: 'Loading more entries...',
 *       onLoading: true,
 *       onFetching: true, // Block EVERY page load ✅
 *       priority: 60,
 *     }
 *   });
 *
 *   const isBlocked = useIsBlocked('audit-logs');
 *
 *   // isBlocked === true during BOTH:
 *   // 1. Initial load
 *   // 2. Every "load more" click
 *   //
 *   // Use when each page is critical and shouldn't allow
 *   // user actions while loading
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Scope isolation - infinite scroll doesn't block unrelated UI
 * ```ts
 * import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';
 *
 * function ProductCatalog() {
 *   const query = useBlockingInfiniteQuery({
 *     queryKey: ['products'],
 *     queryFn: ({ pageParam }) => fetchProducts(pageParam),
 *     getNextPageParam: (lastPage) => lastPage.nextPage,
 *     initialPageParam: 1,
 *     blockingConfig: {
 *       scope: 'product-list',
 *       reasonOnLoading: 'Loading products...',
 *       onLoading: true,
 *       onFetching: false,
 *     }
 *   });
 *   return null;
 * }
 *
 * // Product list is blocked during initial load
 * function ProductGrid() {
 *   const isBlocked = useIsBlocked('product-list');
 *   // isBlocked === true only during first page
 *   return null;
 * }
 *
 * // Filters remain interactive (different scope)
 * function ProductFilters() {
 *   const isBlocked = useIsBlocked('filters');
 *   // isBlocked === false - filters always work! ✅
 *   return null;
 * }
 *
 * // Cart stays functional (different scope)
 * function ShoppingCart() {
 *   const isBlocked = useIsBlocked('cart');
 *   // isBlocked === false - cart always works! ✅
 *   return null;
 * }
 * ```
 *
 *
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useInfiniteQuery | TanStack Query useInfiniteQuery docs}
 * @see {@link useBlockingQuery} for regular queries
 * @see {@link useBlockingMutation} for mutations
 *
 * @public
 * @since 0.2.0
 */
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

  const blockerId = useQueryBlockerId("infinite-query", options.queryKey);

  const {
    scope,
    reason = "Loading more data...",
    reasonOnLoading,
    reasonOnFetching,
    reasonOnError,
    priority = 10,
    timeout,
    onTimeout,
    onLoading = true,
    onFetching = false,
    onError = false,
  } = blockingConfig;

  const isFetchingButNotLoading =
    query.isRefetching || query.isFetchingNextPage || query.isFetchingPreviousPage;

  const shouldBlock =
    (onLoading && query.isPending) ||
    (onFetching && isFetchingButNotLoading) ||
    (onError && query.isError);

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: query.isPending, reason: reasonOnLoading },
      { condition: isFetchingButNotLoading, reason: reasonOnFetching },
      { condition: query.isError, reason: reasonOnError },
    ],
  });

  useBlockingManager({
    blockerId,
    shouldBlock,
    scope,
    reason: currentReason,
    priority,
    timeout,
    onTimeout,
  });

  return query;
}
