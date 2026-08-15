[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / TypedHooks

# Interface: TypedHooks\<TScope\>

Defined in: [src/createTypedHooks.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L10)

Return type for createTypedHooks factory

## Type Parameters

### TScope

`TScope` *extends* `string`

## Properties

### useBlocker()

> **useBlocker**: (`blockerId`, `config`, `isActive?`) => `void`

Defined in: [src/createTypedHooks.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L14)

Type-safe version of useBlocker hook

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

### useIsBlocked()

> **useIsBlocked**: (`scope?`) => `boolean`

Defined in: [src/createTypedHooks.ts:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L19)

Type-safe version of useIsBlocked hook

#### Parameters

##### scope?

[`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

#### Returns

`boolean`

***

### useAsyncAction()

> **useAsyncAction**: \<`T`\>(`actionId`, `scope?`, `options?`) => (`asyncFn`) => `Promise`\<`T`\>

Defined in: [src/createTypedHooks.ts:24](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L24)

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

> (`asyncFn`): `Promise`\<`T`\>

##### Parameters

###### asyncFn

() => `Promise`\<`T`\>

##### Returns

`Promise`\<`T`\>

***

### useBlockingInfo()

> **useBlockingInfo**: (`scope`) => readonly [`BlockerInfo`](BlockerInfo.md)[]

Defined in: [src/createTypedHooks.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L33)

Type-safe version of useBlockingInfo hook

#### Parameters

##### scope

`TScope`

#### Returns

readonly [`BlockerInfo`](BlockerInfo.md)[]
