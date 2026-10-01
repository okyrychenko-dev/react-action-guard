[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / useBlockingMutation

# Function: useBlockingMutation()

> **useBlockingMutation**\<`TData`, `TError`, `TVariables`, `TOnMutateResult`\>(`options`, `queryClient?`): `UseMutationResult`\<`TData`, `TError`, `TVariables`, `TOnMutateResult`\>

Defined in: [packages/tanstack/src/hooks/useBlockingMutation.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingMutation.ts#L11)

Wraps TanStack Mutation with UI blocking.

## Type Parameters

### TData

`TData` = `unknown`

### TError

`TError` = `Error`

### TVariables

`TVariables` = `void`

### TOnMutateResult

`TOnMutateResult` = `unknown`

## Parameters

### options

[`UseBlockingMutationOptions`](../interfaces/UseBlockingMutationOptions.md)\<`TData`, `TError`, `TVariables`, `TOnMutateResult`\>

### queryClient?

`QueryClient`

## Returns

`UseMutationResult`\<`TData`, `TError`, `TVariables`, `TOnMutateResult`\>
