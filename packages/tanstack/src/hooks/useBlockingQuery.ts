import {
  type DefaultError,
  type DefinedUseQueryResult,
  type NoInfer,
  type QueryClient,
  type QueryKey,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useBlockingManager, useQueryBlockerId } from "../internal";
import { resolveBlockingReason } from "../utils";
import type {
  DefinedInitialDataBlockingQueryOptions,
  UndefinedInitialDataBlockingQueryOptions,
  UseBlockingQueryOptions,
} from "./useBlockingQuery.types";

/**
 * A wrapper around TanStack Query's `useQuery` that integrates with the UI blocking system.
 *
 * This hook provides the same API as `useQuery` with additional blocking configuration.
 * It automatically manages UI blocking based on query states (pending, refetching, error).
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TData - The type of data returned by the hook (after select transformation)
 * @typeParam TQueryKey - The type of the query key
 *
 * @param options - Query options including blocking configuration
 * @returns Query result object from TanStack Query
 *
 * @example
 * Scope isolation - independent UI sections
 * ```ts
 * import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * // Component A: Loads data for table
 * function UserTableLoader() {
 *   useBlockingQuery({
 *     queryKey: ['users'],
 *     queryFn: fetchUsers,
 *     blockingConfig: {
 *       scope: 'users-table',
 *       reasonOnLoading: 'Loading users...',
 *     }
 *   });
 *   return null;
 * }
 *
 * // Component B: Table checks its scope
 * function UserTable() {
 *   const isBlocked = useIsBlocked('users-table');
 *   const blockers = useBlockingInfo('users-table');
 *
 *   if (isBlocked) {
 *     // Show: "Loading users..." from blockers[0].reason
 *     return null;
 *   }
 *   return null; // render table
 * }
 *
 * // Component C: Sidebar is independent
 * function Sidebar() {
 *   const isBlocked = useIsBlocked('sidebar');
 *   // isBlocked === false - sidebar fully interactive! ✅
 *   return null;
 * }
 * ```
 *
 * @example
 * Background refresh - don't block UI updates
 * ```ts
 * import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * function LiveDashboard()  {
 *   const query = useBlockingQuery({
 *     queryKey: ['metrics'],
 *     queryFn: fetchMetrics,
 *     refetchInterval: 5000, // Auto-refresh every 5s
 *     blockingConfig: {
 *       scope: 'dashboard',
 *       reasonOnLoading: 'Loading dashboard...',
 *       reasonOnFetching: 'Refreshing data...',
 *       onLoading: true,   // Block initial load
 *       onFetching: false, // Don't block refresh ✅
 *     }
 *   });
 *
 *   const blockers = useBlockingInfo('dashboard');
 *
 *   // Initial load: blockers.length > 0, show full loading
 *   // Background refresh: blockers.length === 0, show subtle indicator
 *   // This prevents janky UI during auto-updates
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Error handling - keep blocking during retries
 * ```ts
 * import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * function CriticalDataLoader() {
 *   const query = useBlockingQuery({
 *     queryKey: ['critical-config'],
 *     queryFn: fetchCriticalConfig,
 *     retry: 3,
 *     retryDelay: 1000,
 *     blockingConfig: {
 *       scope: 'app-init',
 *       reasonOnLoading: 'Loading configuration...',
 *       reasonOnError: 'Config failed, retrying...',
 *       onLoading: true,
 *       onError: true, // Keep blocking during retries ✅
 *       priority: 100,
 *     }
 *   });
 *
 *   const blockers = useBlockingInfo('app-init');
 *
 *   // During retry:
 *   // blockers[0].reason === "Config failed, retrying..."
 *   // User sees what's happening, not just stuck
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Multiple scopes - coordinate across app
 * ```ts
 * import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';
 *
 * function CheckoutDataLoader() {
 *   useBlockingQuery({
 *     queryKey: ['checkout-session'],
 *     queryFn: fetchCheckoutSession,
 *     blockingConfig: {
 *       // Block MULTIPLE scopes simultaneously
 *       scope: ['checkout', 'navigation', 'forms'],
 *       reasonOnLoading: 'Loading checkout...',
 *       priority: 90,
 *     }
 *   });
 *   return null;
 * }
 *
 * // Different components check different scopes
 * function CheckoutForm() {
 *   const isBlocked = useIsBlocked('forms');
 *   // Forms disabled during checkout load
 *   return null;
 * }
 *
 * function NavigationBar() {
 *   const isBlocked = useIsBlocked('navigation');
 *   // Navigation locked during checkout load
 *   return null;
 * }
 *
 * function PaymentSection() {
 *   const isBlocked = useIsBlocked('checkout');
 *   // Entire checkout blocked
 *   return null;
 * }
 *
 * // All synchronized via scope array! 🎯
 * ```
 *
 */
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

  const blockerId = useQueryBlockerId("query", options.queryKey);

  const {
    scope,
    reason = "Loading data...",
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

  const shouldBlock =
    (onLoading && query.isPending) ||
    (onFetching && query.isRefetching) ||
    (onError && query.isError);

  const currentReason = resolveBlockingReason({
    defaultReason: reason,
    stateReasons: [
      { condition: query.isPending, reason: reasonOnLoading },
      { condition: query.isRefetching, reason: reasonOnFetching },
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
