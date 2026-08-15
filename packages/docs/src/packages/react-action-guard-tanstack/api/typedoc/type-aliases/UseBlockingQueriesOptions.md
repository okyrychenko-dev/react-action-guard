[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / UseBlockingQueriesOptions

# Type Alias: UseBlockingQueriesOptions\<TQueryFnData, TError, TData, TQueryKey\>

> **UseBlockingQueriesOptions**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\> = `UseQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>

Defined in: [src/hooks/useBlockingQueries.types.ts:50](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L50)

Options for a single query within useBlockingQueries.
Extends TanStack Query's UseQueryOptions.

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
