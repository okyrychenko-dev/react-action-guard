[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / UseAsyncActionReturn

# Type Alias: UseAsyncActionReturn\<T\>

> **UseAsyncActionReturn**\<`T`\> = \<`TResult`\>(`asyncFn`) => `Promise`\<`TResult`\>

Defined in: [hooks/useAsyncAction/useAsyncAction.types.ts:2](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.types.ts#L2)

Executes an async callback while preserving its inferred result and optional hook result bound.

## Type Parameters

### T

`T` = `unknown`

## Type Parameters

### TResult

`TResult` *extends* `T`

## Parameters

### asyncFn

() => `Promise`\<`TResult`\>

## Returns

`Promise`\<`TResult`\>
