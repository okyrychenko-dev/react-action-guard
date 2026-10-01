[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / UseBlockingMutationOptions

# Interface: UseBlockingMutationOptions\<TData, TError, TVariables, TOnMutateResult\>

Defined in: [packages/tanstack/src/hooks/useBlockingMutation.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingMutation.types.ts#L21)

## Extends

- `UseMutationOptions`\<`TData`, `TError`, `TVariables`, `TOnMutateResult`\>

## Type Parameters

### TData

`TData` = `unknown`

### TError

`TError` = `DefaultError`

### TVariables

`TVariables` = `void`

### TOnMutateResult

`TOnMutateResult` = `unknown`

## Properties

### blockingConfig

> **blockingConfig**: [`MutationBlockingConfig`](../type-aliases/MutationBlockingConfig.md)

Defined in: [packages/tanstack/src/hooks/useBlockingMutation.types.ts:27](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingMutation.types.ts#L27)

***

### mutationFn?

> `optional` **mutationFn?**: `MutationFunction`\<`TData`, `TVariables`\>

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1198

#### Inherited from

`UseMutationOptions.mutationFn`

***

### mutationKey?

> `optional` **mutationKey?**: readonly `unknown`[]

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1199

#### Inherited from

`UseMutationOptions.mutationKey`

***

### onMutate?

> `optional` **onMutate?**: (`variables`, `context`) => `TOnMutateResult` \| `Promise`\<`TOnMutateResult`\>

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1200

#### Parameters

##### variables

`TVariables`

##### context

`MutationFunctionContext`

#### Returns

`TOnMutateResult` \| `Promise`\<`TOnMutateResult`\>

#### Inherited from

`UseMutationOptions.onMutate`

***

### onSuccess?

> `optional` **onSuccess?**: (`data`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1201

#### Parameters

##### data

`TData`

##### variables

`TVariables`

##### onMutateResult

`TOnMutateResult`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onSuccess`

***

### onError?

> `optional` **onError?**: (`error`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1202

#### Parameters

##### error

`TError`

##### variables

`TVariables`

##### onMutateResult

`TOnMutateResult` \| `undefined`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onError`

***

### onSettled?

> `optional` **onSettled?**: (`data`, `error`, `variables`, `onMutateResult`, `context`) => `unknown`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1203

#### Parameters

##### data

`TData` \| `undefined`

##### error

`TError` \| `null`

##### variables

`TVariables`

##### onMutateResult

`TOnMutateResult` \| `undefined`

##### context

`MutationFunctionContext`

#### Returns

`unknown`

#### Inherited from

`UseMutationOptions.onSettled`

***

### retry?

> `optional` **retry?**: `RetryValue`\<`TError`\>

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1204

#### Inherited from

`UseMutationOptions.retry`

***

### retryDelay?

> `optional` **retryDelay?**: `RetryDelayValue`\<`TError`\>

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1205

#### Inherited from

`UseMutationOptions.retryDelay`

***

### networkMode?

> `optional` **networkMode?**: `NetworkMode`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1206

#### Inherited from

`UseMutationOptions.networkMode`

***

### gcTime?

> `optional` **gcTime?**: `number`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1207

#### Inherited from

`UseMutationOptions.gcTime`

***

### meta?

> `optional` **meta?**: `Record`\<`string`, `unknown`\>

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1209

#### Inherited from

`UseMutationOptions.meta`

***

### scope?

> `optional` **scope?**: `MutationScope`

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1210

#### Inherited from

`UseMutationOptions.scope`

***

### throwOnError?

> `optional` **throwOnError?**: `boolean` \| ((`error`) => `boolean`)

Defined in: node\_modules/.pnpm/@tanstack+query-core@5.90.10/node\_modules/@tanstack/query-core/build/legacy/hydration-DksKBgQq.d.ts:1213

#### Inherited from

`UseMutationOptions.throwOnError`
