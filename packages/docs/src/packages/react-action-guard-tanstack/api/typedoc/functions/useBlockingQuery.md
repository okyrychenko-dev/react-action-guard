[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingQuery

# Function: useBlockingQuery()

> **useBlockingQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>(`options`): `UseQueryResult`\<`TData`, `TError`\>

Defined in: [src/hooks/useBlockingQuery.ts:160](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQuery.ts#L160)

A wrapper around TanStack Query's `useQuery` that integrates with the UI blocking system.

This hook provides the same API as `useQuery` with additional blocking configuration.
It automatically manages UI blocking based on query states (loading, fetching, error).

## Type Parameters

### TQueryFnData

`TQueryFnData` = `unknown`

The type of data returned by the query function

### TError

`TError` = `Error`

The type of error that can be thrown

### TData

`TData` = `TQueryFnData`

The type of data returned by the hook (after select transformation)

### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

The type of the query key

## Parameters

### options

[`UseBlockingQueryOptions`](../interfaces/UseBlockingQueryOptions.md)\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>

Query options including blocking configuration

## Returns

`UseQueryResult`\<`TData`, `TError`\>

Query result object from TanStack Query

## Examples

Scope isolation - independent UI sections
```ts
import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

// Component A: Loads data for table
function UserTableLoader() {
  useBlockingQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    blockingConfig: {
      scope: 'users-table',
      reasonOnLoading: 'Loading users...',
    }
  });
  return null;
}

// Component B: Table checks its scope
function UserTable() {
  const isBlocked = useIsBlocked('users-table');
  const blockers = useBlockingInfo('users-table');
  
  if (isBlocked) {
    // Show: "Loading users..." from blockers[0].reason
    return null;
  }
  return null; // render table
}

// Component C: Sidebar is independent
function Sidebar() {
  const isBlocked = useIsBlocked('sidebar');
  // isBlocked === false - sidebar fully interactive! ✅
  return null;
}
```

Background refresh - don't block UI updates
```ts
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function LiveDashboard()  {
  const query = useBlockingQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 5000, // Auto-refresh every 5s
    blockingConfig: {
      scope: 'dashboard',
      reasonOnLoading: 'Loading dashboard...',
      reasonOnFetching: 'Refreshing data...',
      onLoading: true,   // Block initial load
      onFetching: false, // Don't block refresh ✅
    }
  });
  
  const blockers = useBlockingInfo('dashboard');
  
  // Initial load: blockers.length > 0, show full loading
  // Background refresh: blockers.length === 0, show subtle indicator
  // This prevents janky UI during auto-updates
  
  return null;
}
```

Error handling - keep blocking during retries
```ts
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function CriticalDataLoader() {
  const query = useBlockingQuery({
    queryKey: ['critical-config'],
    queryFn: fetchCriticalConfig,
    retry: 3,
    retryDelay: 1000,
    blockingConfig: {
      scope: 'app-init',
      reasonOnLoading: 'Loading configuration...',
      reasonOnError: 'Config failed, retrying...',
      onLoading: true,
      onError: true, // Keep blocking during retries ✅
      priority: 100,
    }
  });
  
  const blockers = useBlockingInfo('app-init');
  
  // During retry:
  // blockers[0].reason === "Config failed, retrying..."
  // User sees what's happening, not just stuck
  
  return null;
}
```

Multiple scopes - coordinate across app
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function CheckoutDataLoader() {
  useBlockingQuery({
    queryKey: ['checkout-session'],
    queryFn: fetchCheckoutSession,
    blockingConfig: {
      // Block MULTIPLE scopes simultaneously
      scope: ['checkout', 'navigation', 'forms'],
      reasonOnLoading: 'Loading checkout...',
      priority: 90,
    }
  });
  return null;
}

// Different components check different scopes
function CheckoutForm() {
  const isBlocked = useIsBlocked('forms');
  // Forms disabled during checkout load
  return null;
}

function NavigationBar() {
  const isBlocked = useIsBlocked('navigation');
  // Navigation locked during checkout load
  return null;
}

function PaymentSection() {
  const isBlocked = useIsBlocked('checkout');
  // Entire checkout blocked
  return null;
}

// All synchronized via scope array! 🎯
```
