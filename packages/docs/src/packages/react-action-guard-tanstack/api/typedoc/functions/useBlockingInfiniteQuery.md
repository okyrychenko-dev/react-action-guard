[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingInfiniteQuery

# Function: useBlockingInfiniteQuery()

## Call Signature

> **useBlockingInfiniteQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>(`options`, `queryClient?`): `DefinedUseInfiniteQueryResult`\<`TData`, `TError`\>

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.ts#L18)

Wraps TanStack Infinite Query with UI blocking.

### Type Parameters

#### TQueryFnData

`TQueryFnData`

#### TError

`TError` = `Error`

#### TData

`TData` = `InfiniteData`\<`TQueryFnData`, `unknown`\>

#### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

#### TPageParam

`TPageParam` = `unknown`

### Parameters

#### options

`DefinedInitialDataBlockingInfiniteQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>

#### queryClient?

`QueryClient`

### Returns

`DefinedUseInfiniteQueryResult`\<`TData`, `TError`\>

## Call Signature

> **useBlockingInfiniteQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>(`options`, `queryClient?`): `UseInfiniteQueryResult`\<`TData`, `TError`\>

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.ts:35](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.ts#L35)

Wraps TanStack Infinite Query with UI blocking.

### Type Parameters

#### TQueryFnData

`TQueryFnData`

#### TError

`TError` = `Error`

#### TData

`TData` = `InfiniteData`\<`TQueryFnData`, `unknown`\>

#### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

#### TPageParam

`TPageParam` = `unknown`

### Parameters

#### options

`UndefinedInitialDataBlockingInfiniteQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`, `TPageParam`\>

#### queryClient?

`QueryClient`

### Returns

`UseInfiniteQueryResult`\<`TData`, `TError`\>
