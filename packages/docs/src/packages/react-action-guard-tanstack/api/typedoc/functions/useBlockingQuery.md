[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingQuery

# Function: useBlockingQuery()

## Call Signature

> **useBlockingQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>(`options`, `queryClient?`): `DefinedUseQueryResult`\<`NoInfer`\<`TData`\>, `TError`\>

Defined in: [packages/tanstack/src/hooks/useBlockingQuery.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingQuery.ts#L18)

Wraps TanStack Query with UI blocking.

### Type Parameters

#### TQueryFnData

`TQueryFnData` = `unknown`

#### TError

`TError` = `Error`

#### TData

`TData` = `TQueryFnData`

#### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

### Parameters

#### options

`DefinedInitialDataBlockingQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>

#### queryClient?

`QueryClient`

### Returns

`DefinedUseQueryResult`\<`NoInfer`\<`TData`\>, `TError`\>

## Call Signature

> **useBlockingQuery**\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>(`options`, `queryClient?`): `UseQueryResult`\<`NoInfer`\<`TData`\>, `TError`\>

Defined in: [packages/tanstack/src/hooks/useBlockingQuery.ts:28](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingQuery.ts#L28)

Wraps TanStack Query with UI blocking.

### Type Parameters

#### TQueryFnData

`TQueryFnData` = `unknown`

#### TError

`TError` = `Error`

#### TData

`TData` = `TQueryFnData`

#### TQueryKey

`TQueryKey` *extends* readonly `unknown`[] = readonly `unknown`[]

### Parameters

#### options

`UndefinedInitialDataBlockingQueryOptions`\<`TQueryFnData`, `TError`, `TData`, `TQueryKey`\>

#### queryClient?

`QueryClient`

### Returns

`UseQueryResult`\<`NoInfer`\<`TData`\>, `TError`\>
