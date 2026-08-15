[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingInfiniteQuery

# Function: useBlockingInfiniteQuery()

> **useBlockingInfiniteQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>(`options`): `UseInfiniteQueryResult`\<`TData`, `TError`\>

Defined in: [src/hooks/useBlockingInfiniteQuery.ts:170](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingInfiniteQuery.ts#L170)

A drop-in replacement for TanStack Query's `useInfiniteQuery` with automatic UI blocking.

This hook wraps TanStack Query's `useInfiniteQuery` for infinite scrolling/pagination scenarios
with automatic UI blocking. It handles blocking during initial page load and optionally during
loading of additional pages (next/previous).

By default, only blocks during initial data load (`isLoading`), not when fetching more pages.
This allows users to continue interacting with already-loaded content while more loads in the background.

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

### TPageParam

`TPageParam` = `unknown`

The type of the page parameter (default: unknown)

## Parameters

### options

[`UseBlockingInfiniteQueryOptions`](../interfaces/UseBlockingInfiniteQueryOptions.md)\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>

Combined TanStack Query infinite query options and blocking configuration

## Returns

`UseInfiniteQueryResult`\<`TData`, `TError`\>

Infinite query result object from TanStack Query

## Examples

Visual feedback - distinguish initial load vs "load more"
```ts
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function InfinitePostFeed() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    blockingConfig: {
      scope: 'posts-feed',
      reasonOnLoading: 'Loading posts...',
      reasonOnFetching: 'Loading more...',
      onLoading: true,   // Block initial load
      onFetching: false, // Don't block "load more" ✅
    }
  });
  
  const blockers = useBlockingInfo('posts-feed');
  const isInitialLoad = blockers.length > 0;
  
  if (isInitialLoad) {
    // blockers[0].reason === "Loading posts..."
    // Show full-page skeleton
    return null;
  }
  
  // Background pagination:
  // - blockers.length === 0
  // - query.isFetchingNextPage === true
  // Show inline "Load more..." button instead of blocking
  
  return null;
}
```

Block all pages - critical data loading
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function AuditLogViewer() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['audit-logs'],
    queryFn: ({ pageParam }) => fetchAuditLogs(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    blockingConfig: {
      scope: 'audit-logs',
      reasonOnLoading: 'Loading audit logs...',
      reasonOnFetching: 'Loading more entries...',
      onLoading: true,
      onFetching: true, // Block EVERY page load ✅
      priority: 60,
    }
  });
  
  const isBlocked = useIsBlocked('audit-logs');
  
  // isBlocked === true during BOTH:
  // 1. Initial load
  // 2. Every "load more" click
  // 
  // Use when each page is critical and shouldn't allow
  // user actions while loading
  
  return null;
}
```

Scope isolation - infinite scroll doesn't block unrelated UI
```ts
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function ProductCatalog() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetchProducts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    blockingConfig: {
      scope: 'product-list',
      reasonOnLoading: 'Loading products...',
      onLoading: true,
      onFetching: false,
    }
  });
  return null;
}

// Product list is blocked during initial load
function ProductGrid() {
  const isBlocked = useIsBlocked('product-list');
  // isBlocked === true only during first page
  return null;
}

// Filters remain interactive (different scope)
function ProductFilters() {
  const isBlocked = useIsBlocked('filters');
  // isBlocked === false - filters always work! ✅
  return null;
}

// Cart stays functional (different scope)
function ShoppingCart() {
  const isBlocked = useIsBlocked('cart');
  // isBlocked === false - cart always works! ✅
  return null;
}
```

## See

 - [TanStack Query useInfiniteQuery docs](https://tanstack.com/query/latest/docs/react/reference/useInfiniteQuery)
 - [useBlockingQuery](useBlockingQuery.md) for regular queries
 - [useBlockingMutation](useBlockingMutation.md) for mutations

## Since

0.6.0
