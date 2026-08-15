[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / UseBlockingMutationOptions

# Interface: UseBlockingMutationOptions\<TData, TError, TVariables, TContext\>

Defined in: [src/hooks/useBlockingMutation.types.ts:80](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingMutation.types.ts#L80)

Options for useBlockingMutation hook.
Extends TanStack Query's UseMutationOptions with blocking configuration.

## Extends

- `UseMutationOptions`\<`TData`, `TError`, `TVariables`, `TContext`\>

## Type Parameters

### TData

`TData` = `unknown`

The type of data returned by the mutation

### TError

`TError` = `Error`

The type of error that can be thrown

### TVariables

`TVariables` = `void`

The type of variables passed to the mutation

### TContext

`TContext` = `unknown`

The type of context for optimistic updates

## Properties

### blockingConfig

> **blockingConfig**: [`MutationBlockingConfig`](../type-aliases/MutationBlockingConfig.md)

Defined in: [src/hooks/useBlockingMutation.types.ts:89](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingMutation.types.ts#L89)

Configuration for UI blocking behavior during mutation execution.

***

### mutationFn?

> `optional` **mutationFn**: `MutationFunction`\<`TData`, `TVariables`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1198

#### Inherited from

`UseMutationOptions.mutationFn`

***

### mutationKey?

> `optional` **mutationKey**: readonly `unknown`[]

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1199

#### Inherited from

`UseMutationOptions.mutationKey`

***

### onMutate()?

> `optional` **onMutate**: (`variables`, `context`) => `TContext` \| `Promise`\<`TContext`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1200

#### Parameters

##### variables

`TVariables`

##### context

`MutationFunctionContext`

#### Returns

`TContext` \| `Promise`\<`TContext`\>

#### Inherited from

`UseMutationOptions.onMutate`

***

### onSuccess()?

> `optional` **onSuccess**: (`data`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1201

#### Parameters

##### data

`TData`

##### variables

`TVariables`

##### onMutateResult

`TContext`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onSuccess`

***

### onError()?

> `optional` **onError**: (`error`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1202

#### Parameters

##### error

`TError`

##### variables

`TVariables`

##### onMutateResult

`TContext` | `undefined`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onError`

***

### onSettled()?

> `optional` **onSettled**: (`data`, `error`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1203

#### Parameters

##### data

`TData` | `undefined`

##### error

`TError` | `null`

##### variables

`TVariables`

##### onMutateResult

`TContext` | `undefined`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onSettled`

***

### retry?

> `optional` **retry**: `RetryValue`\<`TError`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1204

#### Inherited from

`UseMutationOptions.retry`

***

### retryDelay?

> `optional` **retryDelay**: `RetryDelayValue`\<`TError`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1205

#### Inherited from

`UseMutationOptions.retryDelay`

***

### networkMode?

> `optional` **networkMode**: `NetworkMode`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1206

#### Inherited from

`UseMutationOptions.networkMode`

***

### gcTime?

> `optional` **gcTime**: `number`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1207

#### Inherited from

`UseMutationOptions.gcTime`

***

### meta?

> `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1209

#### Inherited from

`UseMutationOptions.meta`

***

### scope?

> `optional` **scope**: `MutationScope`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1210

#### Inherited from

`UseMutationOptions.scope`

***

### throwOnError?

> `optional` **throwOnError**: `boolean` \| (`error`) => `boolean`

Defined in: node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1213

#### Inherited from

`UseMutationOptions.throwOnError`
