[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingQueries

# Function: useBlockingQueries()

> **useBlockingQueries**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>(`queries`, `blockingConfig`): `unknown` *extends* `TQueryFnData` \| `InitialDataFunction`\<`TQueryFnData`\> ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TQueryFnData` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TQueryFnData` *extends* () => `TInitialDataResult` ? `unknown` *extends* `TInitialDataResult` ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TInitialDataResult` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> \| `InitialDataFunction`\<`TQueryFnData`\> *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `unknown` *extends* `TQueryFnData` \| `undefined` ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `undefined` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> \| `TQueryFnData` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\>[]

Defined in: [src/hooks/useBlockingQueries.ts:164](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.ts#L164)

A wrapper around TanStack Query's `useQueries` for parallel queries with automatic UI blocking.

This hook wraps TanStack Query's `useQueries` to run multiple queries in parallel while
automatically managing UI blocking based on the combined state of all queries. It blocks when
ANY of the queries meet the blocking conditions (loading, fetching, error).

This is ideal for loading data from multiple sources simultaneously, such as loading
user profile, posts, and comments all at once for a dashboard.

By default, blocks when ANY query is loading but not when queries are fetching in the background.

## Type Parameters

### TQueryFnData

`TQueryFnData` = `unknown`

The type of data returned by the query function

### TError

`TError` = `Error`

The type of error that can be thrown (default: Error)

### TData

`TData` = `TQueryFnData`

The type of data returned by the hook (default: TQueryFnData)

### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

The type of the query key (default: QueryKey)

## Parameters

### queries

readonly [`UseBlockingQueriesOptions`](../type-aliases/UseBlockingQueriesOptions.md)\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>[]

Array of query option objects (same as TanStack Query `useQueries`)

### blockingConfig

[`QueriesBlockingConfig`](../interfaces/QueriesBlockingConfig.md)

Shared blocking configuration for all queries

## Returns

`unknown` *extends* `TQueryFnData` \| `InitialDataFunction`\<`TQueryFnData`\> ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TQueryFnData` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TQueryFnData` *extends* () => `TInitialDataResult` ? `unknown` *extends* `TInitialDataResult` ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `TInitialDataResult` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> \| `InitialDataFunction`\<`TQueryFnData`\> *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `unknown` *extends* `TQueryFnData` \| `undefined` ? `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `undefined` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> \| `TQueryFnData` *extends* `unknown` *extends* `TData` ? `TQueryFnData` : `TData` ? `DefinedUseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\> : `UseQueryResult`\<`unknown` *extends* `TData` ? `TQueryFnData` : `TData`, `unknown` *extends* `TError` ? `Error` : `TError`\>[]

Array of query result objects (same as TanStack Query `useQueries`)

## Examples

Parallel coordination - block until ALL queries ready
```ts
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function DashboardDataLoader() {
  // Load 3 data sources in parallel
  const queries = useBlockingQueries(
    [
      { queryKey: ['user'], queryFn: fetchUser },
      { queryKey: ['posts'], queryFn: fetchPosts },
      { queryKey: ['stats'], queryFn: fetchStats },
    ],
    {
      scope: 'dashboard',
      reasonOnLoading: 'Loading dashboard...',
      priority: 20,
    }
  );
  return null;
}

// Dashboard UI reacts to ALL queries
function Dashboard() {
  const blockers = useBlockingInfo('dashboard');
  
  if (blockers.length > 0) {
    // blockers[0].reason === "Loading dashboard..."
    // Blocked until ALL 3 queries complete
    // Show full dashboard skeleton
    return null;
  }
  
  // All data ready - render full dashboard
  return null;
}
```

Dynamic query arrays - coordinate changing data sources
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function MultiCategoryView({ categoryIds }: { categoryIds: string[] }) {
  // Number of queries changes dynamically
  const queries = useBlockingQueries(
    categoryIds.map(id => ({
      queryKey: ['category', id],
      queryFn: () => fetchCategory(id),
    })),
    {
      scope: 'categories',
      reasonOnLoading: `Loading ${categoryIds.length} categories...`,
    }
  );
  
  return null;
}

// UI reacts to ANY category loading
function CategoryGrid() {
  const isBlocked = useIsBlocked('categories');
  
  // isBlocked === true if ANY category is loading
  // Coordinated loading state for dynamic data
  
  return null;
}
```

Critical initialization - high priority app startup
```ts
import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function AppBootstrap() {
  const queries = useBlockingQueries(
    [
      { queryKey: ['config'], queryFn: fetchAppConfig },
      { queryKey: ['permissions'], queryFn: fetchPermissions },
      { queryKey: ['tenant'], queryFn: fetchTenant },
    ],
    {
      scope: ['app-init', 'global'],
      reasonOnLoading: 'Initializing application...',
      priority: 100, // Highest - blocks everything
      timeout: 30000,
    }
  );
  return null;
}

// Entire app is blocked during initialization
function App() {
  const blockers = useBlockingInfo('global');
  
  if (blockers.length > 0) {
    // Show app-wide loading screen
    // blockers[0].reason === "Initializing application..."
    return null;
  }
  
  // All critical data loaded - render app
  return null;
}

// Individual features check app-init
function FeaturePanel() {
  const isReady = useIsBlocked('app-init');
  
  if (isReady) {
    return null; // Wait for init
  }
  
  return null; // Render feature
}
```

## See

 - [TanStack Query useQueries docs](https://tanstack.com/query/latest/docs/react/reference/useQueries)
 - [useBlockingQuery](useBlockingQuery.md) for single queries
 - [useBlockingMutation](useBlockingMutation.md) for mutations

## Since

0.6.0
