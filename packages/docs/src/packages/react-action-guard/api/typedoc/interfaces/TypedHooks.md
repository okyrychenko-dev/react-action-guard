[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / TypedHooks

# Interface: TypedHooks\<TScope\>

Defined in: [createTypedHooks.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L14)

Return type for createTypedHooks factory

## Type Parameters

### TScope

`TScope` *extends* `string`

## Properties

### useActionBlocker

> **useActionBlocker**: (`blockerId`, `config`, `isActive?`) => `void`

Defined in: [createTypedHooks.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L18)

Type-safe action blocker hook

#### Parameters

##### blockerId

`string`

##### config

[`BlockerConfigTyped`](BlockerConfigTyped.md)\<`TScope`\>

##### isActive?

`boolean`

#### Returns

`void`

***

### ~~useBlocker~~

> **useBlocker**: (`blockerId`, `config`, `isActive?`) => `void`

Defined in: [createTypedHooks.ts:28](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L28)

Backward-compatible name for useActionBlocker

#### Parameters

##### blockerId

`string`

##### config

[`BlockerConfigTyped`](BlockerConfigTyped.md)\<`TScope`\>

##### isActive?

`boolean`

#### Returns

`void`

#### Deprecated

Use `useActionBlocker`.

***

### useIsBlocked

> **useIsBlocked**: (`scope?`) => `boolean`

Defined in: [createTypedHooks.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L33)

Type-safe version of useIsBlocked hook

#### Parameters

##### scope?

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

#### Returns

`boolean`

***

### useAsyncAction

> **useAsyncAction**: \<`T`\>(`actionId`, `scope?`, `options?`) => [`UseAsyncActionReturn`](../type-aliases/UseAsyncActionReturn.md)\<`T`\>

Defined in: [createTypedHooks.ts:38](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L38)

Type-safe version of useAsyncAction hook

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### actionId

`string`

##### scope?

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

##### options?

[`UseAsyncActionOptions`](UseAsyncActionOptions.md)

#### Returns

[`UseAsyncActionReturn`](../type-aliases/UseAsyncActionReturn.md)\<`T`\>

***

### useBlockingInfo

> **useBlockingInfo**: (`scope`) => readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

Defined in: [createTypedHooks.ts:47](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L47)

Type-safe version of useBlockingInfo hook

#### Parameters

##### scope

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

#### Returns

readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]
