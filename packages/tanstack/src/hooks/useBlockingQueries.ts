import { type QueriesResults, type QueryClient, useQueries } from "@tanstack/react-query";
import { useBlockingCoordination } from "../internal";
import type { BlockingQueriesInput, QueriesBlockingConfig } from "./useBlockingQueries.types";

/**
 * A wrapper around TanStack Query's `useQueries` for parallel queries with automatic UI blocking.
 *
 * This hook wraps TanStack Query's `useQueries` to run multiple queries in parallel while
 * automatically managing UI blocking based on the combined state of all queries. It blocks when
 * ANY of the queries meet the blocking conditions (pending, refetching, error).
 *
 * This is ideal for loading data from multiple sources simultaneously, such as loading
 * user profile, posts, and comments all at once for a dashboard.
 *
 * By default, blocks when ANY query is pending but not when queries are refetching in the background.
 *
 * @typeParam TQueryFnData - The type of data returned by the query function
 * @typeParam TError - The type of error that can be thrown (default: Error)
 * @typeParam TData - The type of data returned by the hook (default: TQueryFnData)
 * @typeParam TQueryKey - The type of the query key (default: QueryKey)
 *
 * @param queries - Array of query option objects (same as TanStack Query `useQueries`)
 * @param blockingConfig - Shared blocking configuration for all queries
 * @param blockingConfig.scope - Scope(s) to block (default: 'global')
 * @param blockingConfig.reason - Default blocking reason (default: 'Loading queries...')
 * @param blockingConfig.reasonOnLoading - Reason when ANY query is pending
 * @param blockingConfig.reasonOnFetching - Reason when ANY query is refetching
 * @param blockingConfig.reasonOnError - Reason when ANY query has an error
 * @param blockingConfig.priority - Priority level 0-100 (default: 10)
 * @param blockingConfig.timeout - Auto-remove blocker after N milliseconds
 * @param blockingConfig.onTimeout - Callback when timeout occurs
 * @param blockingConfig.onLoading - Block when ANY query is pending (default: true)
 * @param blockingConfig.onFetching - Block when ANY query is refetching (default: false)
 * @param blockingConfig.onError - Block when ANY query has error (default: false)
 *
 * @returns Array of query result objects (same as TanStack Query `useQueries`)
 *
 * @example
 * Parallel coordination - block until ALL queries ready
 * ```ts
 * import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * function DashboardDataLoader() {
 *   // Load 3 data sources in parallel
 *   const queries = useBlockingQueries(
 *     [
 *       { queryKey: ['user'], queryFn: fetchUser },
 *       { queryKey: ['posts'], queryFn: fetchPosts },
 *       { queryKey: ['stats'], queryFn: fetchStats },
 *     ],
 *     {
 *       scope: 'dashboard',
 *       reasonOnLoading: 'Loading dashboard...',
 *       priority: 20,
 *     }
 *   );
 *   return null;
 * }
 *
 * // Dashboard UI reacts to ALL queries
 * function Dashboard() {
 *   const blockers = useBlockingInfo('dashboard');
 *
 *   if (blockers.length > 0) {
 *     // blockers[0].reason === "Loading dashboard..."
 *     // Blocked until ALL 3 queries complete
 *     // Show full dashboard skeleton
 *     return null;
 *   }
 *
 *   // All data ready - render full dashboard
 *   return null;
 * }
 * ```
 *
 * @example
 * Dynamic query arrays - coordinate changing data sources
 * ```ts
 * import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';
 *
 * function MultiCategoryView({ categoryIds }: { categoryIds: string[] }) {
 *   // Number of queries changes dynamically
 *   const queries = useBlockingQueries(
 *     categoryIds.map(id => ({
 *       queryKey: ['category', id],
 *       queryFn: () => fetchCategory(id),
 *     })),
 *     {
 *       scope: 'categories',
 *       reasonOnLoading: `Loading ${categoryIds.length} categories...`,
 *     }
 *   );
 *
 *   return null;
 * }
 *
 * // UI reacts to ANY category loading
 * function CategoryGrid() {
 *   const isBlocked = useIsBlocked('categories');
 *
 *   // isBlocked === true if ANY category is loading
 *   // Coordinated loading state for dynamic data
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Critical initialization - high priority app startup
 * ```ts
 * import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';
 *
 * function AppBootstrap() {
 *   const queries = useBlockingQueries(
 *     [
 *       { queryKey: ['config'], queryFn: fetchAppConfig },
 *       { queryKey: ['permissions'], queryFn: fetchPermissions },
 *       { queryKey: ['tenant'], queryFn: fetchTenant },
 *     ],
 *     {
 *       scope: ['app-init', 'global'],
 *       reasonOnLoading: 'Initializing application...',
 *       priority: 100, // Highest - blocks everything
 *       timeout: 30000,
 *     }
 *   );
 *   return null;
 * }
 *
 * // Entire app is blocked during initialization
 * function App() {
 *   const blockers = useBlockingInfo('global');
 *
 *   if (blockers.length > 0) {
 *     // Show app-wide loading screen
 *     // blockers[0].reason === "Initializing application..."
 *     return null;
 *   }
 *
 *   // All critical data loaded - render app
 *   return null;
 * }
 *
 * // Individual features check app-init
 * function FeaturePanel() {
 *   const isReady = useIsBlocked('app-init');
 *
 *   if (isReady) {
 *     return null; // Wait for init
 *   }
 *
 *   return null; // Render feature
 * }
 * ```
 *
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useQueries | TanStack Query useQueries docs}
 * @see {@link useBlockingQuery} for single queries
 * @see {@link useBlockingMutation} for mutations
 *
 * @public
 * @since 0.2.0
 */
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
