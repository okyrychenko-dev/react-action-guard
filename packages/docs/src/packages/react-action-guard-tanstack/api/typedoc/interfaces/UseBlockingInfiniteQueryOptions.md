[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / UseBlockingInfiniteQueryOptions

# Interface: UseBlockingInfiniteQueryOptions\<TQueryFnData, TError, TData, TQueryKey, TPageParam\>

Defined in: [src/hooks/useBlockingInfiniteQuery.types.ts:51](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingInfiniteQuery.types.ts#L51)

Options for useBlockingInfiniteQuery hook.
Extends TanStack Query's UseInfiniteQueryOptions with blocking configuration.

## Extends

- `UseInfiniteQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>

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

`TQueryKey` *extends* `QueryKey` = `QueryKey`

The type of the query key

### TPageParam

`TPageParam` = `unknown`

The type of the page parameter

## Properties

### blockingConfig

> **blockingConfig**: [`InfiniteQueryBlockingConfig`](InfiniteQueryBlockingConfig.md)

Defined in: [src/hooks/useBlockingInfiniteQuery.types.ts:61](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingInfiniteQuery.types.ts#L61)

Configuration for UI blocking behavior

***

### retry?

> `optional` **retry**: `RetryValue`\<`TError`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:604

If `false`, failed queries will not retry by default.
If `true`, failed queries will retry infinitely., failureCount: num
If set to an integer number, e.g. 3, failed queries will retry until the failed query count meets that number.
If set to a function `(failureCount, error) => boolean` failed queries will retry until the function returns false.

#### Inherited from

`UseInfiniteQueryOptions.retry`

***

### retryDelay?

> `optional` **retryDelay**: `RetryDelayValue`\<`TError`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:605

#### Inherited from

`UseInfiniteQueryOptions.retryDelay`

***

### networkMode?

> `optional` **networkMode**: `NetworkMode`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:606

#### Inherited from

`UseInfiniteQueryOptions.networkMode`

***

### gcTime?

> `optional` **gcTime**: `number`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:613

The time in milliseconds that unused/inactive cache data remains in memory.
When a query's cache becomes unused or inactive, that cache data will be garbage collected after this duration.
When different garbage collection times are specified, the longest one will be used.
Setting it to `Infinity` will disable garbage collection.

#### Inherited from

`UseInfiniteQueryOptions.gcTime`

***

### queryFn?

> `optional` **queryFn**: *typeof* `skipToken` \| `QueryFunction`\<`TQueryFnData`, `TQueryKey`, `TPageParam`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:614

#### Inherited from

`UseInfiniteQueryOptions.queryFn`

***

### persister?

> `optional` **persister**: `QueryPersister`\<`NoInfer`\<`TQueryFnData`\>, `NoInfer`\<`TQueryKey`\>, `NoInfer`\<`TPageParam`\>\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:615

#### Inherited from

`UseInfiniteQueryOptions.persister`

***

### queryHash?

> `optional` **queryHash**: `string`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:616

#### Inherited from

`UseInfiniteQueryOptions.queryHash`

***

### queryKey

> **queryKey**: `TQueryKey` & `object`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:617

#### Inherited from

`UseInfiniteQueryOptions.queryKey`

***

### queryKeyHashFn?

> `optional` **queryKeyHashFn**: `QueryKeyHashFunction`\<`TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:618

#### Inherited from

`UseInfiniteQueryOptions.queryKeyHashFn`

***

### initialData?

> `optional` **initialData**: `InfiniteData`\<`TQueryFnData`, `TPageParam`\> \| `InitialDataFunction`\<`InfiniteData`\<`TQueryFnData`, `TPageParam`\>\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:619

#### Inherited from

`UseInfiniteQueryOptions.initialData`

***

### initialDataUpdatedAt?

> `optional` **initialDataUpdatedAt**: `number` \| () => `number` \| `undefined`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:620

#### Inherited from

`UseInfiniteQueryOptions.initialDataUpdatedAt`

***

### behavior?

> `optional` **behavior**: `QueryBehavior`\<`TQueryFnData`, `TError`, `InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:621

#### Inherited from

`UseInfiniteQueryOptions.behavior`

***

### structuralSharing?

> `optional` **structuralSharing**: `boolean` \| (`oldData`, `newData`) => `unknown`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:627

Set this to `false` to disable structural sharing between query results.
Set this to a function which accepts the old and new data and returns resolved data of the same type to implement custom structural sharing logic.
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.structuralSharing`

***

### \_defaulted?

> `optional` **\_defaulted**: `boolean`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:628

#### Inherited from

`UseInfiniteQueryOptions._defaulted`

***

### meta?

> `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:633

Additional payload to be stored on each query.
Use this property to pass information that can be used in other places.

#### Inherited from

`UseInfiniteQueryOptions.meta`

***

### maxPages?

> `optional` **maxPages**: `number`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:637

Maximum number of pages to store in the data of an infinite query.

#### Inherited from

`UseInfiniteQueryOptions.maxPages`

***

### initialPageParam

> **initialPageParam**: `TPageParam`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:640

#### Inherited from

`UseInfiniteQueryOptions.initialPageParam`

***

### getPreviousPageParam?

> `optional` **getPreviousPageParam**: `GetPreviousPageParamFunction`\<`TPageParam`, `TQueryFnData`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:647

This function can be set to automatically get the previous cursor for infinite queries.
The result will also be used to determine the value of `hasPreviousPage`.

#### Inherited from

`UseInfiniteQueryOptions.getPreviousPageParam`

***

### getNextPageParam

> **getNextPageParam**: `GetNextPageParamFunction`\<`TPageParam`, `TQueryFnData`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:652

This function can be set to automatically get the next cursor for infinite queries.
The result will also be used to determine the value of `hasNextPage`.

#### Inherited from

`UseInfiniteQueryOptions.getNextPageParam`

***

### enabled?

> `optional` **enabled**: `Enabled`\<`TQueryFnData`, `TError`, `InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:662

Set this to `false` or a function that returns `false` to disable automatic refetching when the query mounts or changes query keys.
To refetch the query, use the `refetch` method returned from the `useQuery` instance.
Accepts a boolean or function that returns a boolean.
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.enabled`

***

### staleTime?

> `optional` **staleTime**: `StaleTimeFunction`\<`TQueryFnData`, `TError`, `InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:669

The time in milliseconds after data is considered stale.
If set to `Infinity`, the data will never be considered stale.
If set to a function, the function will be executed with the query to compute a `staleTime`.
Defaults to `0`.

#### Inherited from

`UseInfiniteQueryOptions.staleTime`

***

### refetchInterval?

> `optional` **refetchInterval**: `number` \| `false` \| (`query`) => `number` \| `false` \| `undefined`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:675

If set to a number, the query will continuously refetch at this frequency in milliseconds.
If set to a function, the function will be executed with the latest data and query to compute a frequency
Defaults to `false`.

#### Inherited from

`UseInfiniteQueryOptions.refetchInterval`

***

### refetchIntervalInBackground?

> `optional` **refetchIntervalInBackground**: `boolean`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:680

If set to `true`, the query will continue to refetch while their tab/window is in the background.
Defaults to `false`.

#### Inherited from

`UseInfiniteQueryOptions.refetchIntervalInBackground`

***

### refetchOnWindowFocus?

> `optional` **refetchOnWindowFocus**: `boolean` \| `"always"` \| (`query`) => `boolean` \| `"always"`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:688

If set to `true`, the query will refetch on window focus if the data is stale.
If set to `false`, the query will not refetch on window focus.
If set to `'always'`, the query will always refetch on window focus.
If set to a function, the function will be executed with the latest data and query to compute the value.
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.refetchOnWindowFocus`

***

### refetchOnReconnect?

> `optional` **refetchOnReconnect**: `boolean` \| `"always"` \| (`query`) => `boolean` \| `"always"`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:696

If set to `true`, the query will refetch on reconnect if the data is stale.
If set to `false`, the query will not refetch on reconnect.
If set to `'always'`, the query will always refetch on reconnect.
If set to a function, the function will be executed with the latest data and query to compute the value.
Defaults to the value of `networkOnline` (`true`)

#### Inherited from

`UseInfiniteQueryOptions.refetchOnReconnect`

***

### refetchOnMount?

> `optional` **refetchOnMount**: `boolean` \| `"always"` \| (`query`) => `boolean` \| `"always"`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:704

If set to `true`, the query will refetch on mount if the data is stale.
If set to `false`, will disable additional instances of a query to trigger background refetch.
If set to `'always'`, the query will always refetch on mount.
If set to a function, the function will be executed with the latest data and query to compute the value
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.refetchOnMount`

***

### retryOnMount?

> `optional` **retryOnMount**: `boolean`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:709

If set to `false`, the query will not be retried on mount if it contains an error.
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.retryOnMount`

***

### notifyOnChangeProps?

> `optional` **notifyOnChangeProps**: `NotifyOnChangeProps`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:717

If set, the component will only re-render if any of the listed properties change.
When set to `['data', 'error']`, the component will only re-render when the `data` or `error` properties change.
When set to `'all'`, the component will re-render whenever a query is updated.
When set to a function, the function will be executed to compute the list of properties.
By default, access to properties will be tracked, and the component will only re-render when one of the tracked properties change.

#### Inherited from

`UseInfiniteQueryOptions.notifyOnChangeProps`

***

### throwOnError?

> `optional` **throwOnError**: `ThrowOnError`\<`TQueryFnData`, `TError`, `InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:725

Whether errors should be thrown instead of setting the `error` property.
If set to `true` or `suspense` is `true`, all errors will be thrown to the error boundary.
If set to `false` and `suspense` is `false`, errors are returned as state.
If set to a function, it will be passed the error and the query, and it should return a boolean indicating whether to show the error in an error boundary (`true`) or return the error as state (`false`).
Defaults to `false`.

#### Inherited from

`UseInfiniteQueryOptions.throwOnError`

***

### select()?

> `optional` **select**: (`data`) => `TData`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:729

This option can be used to transform or select a part of the data returned by the query function.

#### Parameters

##### data

`InfiniteData`

#### Returns

`TData`

#### Inherited from

`UseInfiniteQueryOptions.select`

***

### placeholderData?

> `optional` **placeholderData**: `InfiniteData`\<`TQueryFnData`, `TPageParam`\> \| `PlaceholderDataFunction`\<`InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TError`, `InfiniteData`\<`TQueryFnData`, `TPageParam`\>, `TQueryKey`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:739

If set, this value will be used as the placeholder data for this particular query observer while the query is still in the `loading` data and no initialData has been provided.

#### Inherited from

`UseInfiniteQueryOptions.placeholderData`

***

### \_optimisticResults?

> `optional` **\_optimisticResults**: `"optimistic"` \| `"isRestoring"`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:740

#### Inherited from

`UseInfiniteQueryOptions._optimisticResults`

***

### experimental\_prefetchInRender?

> `optional` **experimental\_prefetchInRender**: `boolean`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:744

Enable prefetching during rendering

#### Inherited from

`UseInfiniteQueryOptions.experimental_prefetchInRender`

***

### subscribed?

> `optional` **subscribed**: `boolean`

Defined in: node\_modules/@tanstack/react-query/build/legacy/types.d.ts:27

Set this to `false` to unsubscribe this observer from updates to the query cache.
Defaults to `true`.

#### Inherited from

`UseInfiniteQueryOptions.subscribed`
