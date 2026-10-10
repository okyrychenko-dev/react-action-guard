[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / TypedHooks

# Interface: TypedHooks\<TScope\>

Defined in: [createTypedHooks.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L10)

Return type for createTypedHooks factory

## Type Parameters

### TScope

`TScope` *extends* `string`

## Properties

### useActionBlocker

> **useActionBlocker**: (`blockerId`, `config`, `isActive?`) => `void`

Defined in: [createTypedHooks.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L14)

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

Defined in: [createTypedHooks.ts:24](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L24)

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

Defined in: [createTypedHooks.ts:29](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L29)

Type-safe version of useIsBlocked hook

#### Parameters

##### scope?

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

#### Returns

`boolean`

***

### useAsyncAction

> **useAsyncAction**: \<`T`\>(`actionId`, `scope?`, `options?`) => (`asyncFn`) => `Promise`\<`T`\>

Defined in: [createTypedHooks.ts:34](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L34)

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

(`asyncFn`) => `Promise`\<`T`\>

***

### useBlockingInfo

> **useBlockingInfo**: (`scope`) => readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

Defined in: [createTypedHooks.ts:43](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L43)

Type-safe version of useBlockingInfo hook

#### Parameters

##### scope

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

#### Returns

readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]
