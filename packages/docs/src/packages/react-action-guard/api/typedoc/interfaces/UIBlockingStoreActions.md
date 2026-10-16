[**React Action Guard API v2.0.0**](../README.md)

***

[React Action Guard API](../README.md) / UIBlockingStoreActions

# Interface: UIBlockingStoreActions

Defined in: [store/uiBlockingStore.types.ts:53](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L53)

All available actions for managing UI blocking state.

## Since

0.6.0

## Properties

### addBlocker

> **addBlocker**: (`id`, `config?`) => `void`

Defined in: [store/uiBlockingStore.types.ts:54](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L54)

#### Parameters

##### id

`string`

##### config?

[`BlockerConfig`](BlockerConfig.md)

#### Returns

`void`

***

### updateBlocker

> **updateBlocker**: (`id`, `config?`) => `void`

Defined in: [store/uiBlockingStore.types.ts:55](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L55)

#### Parameters

##### id

`string`

##### config?

`Partial`\<[`BlockerConfig`](BlockerConfig.md)\>

#### Returns

`void`

***

### removeBlocker

> **removeBlocker**: (`id`) => `void`

Defined in: [store/uiBlockingStore.types.ts:58](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L58)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### isBlocked

> **isBlocked**: (`scope?`) => `boolean`

Defined in: [store/uiBlockingStore.types.ts:59](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L59)

#### Parameters

##### scope?

`string` \| readonly `string`[]

#### Returns

`boolean`

***

### getBlockingInfo

> **getBlockingInfo**: (`scope`) => readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

Defined in: [store/uiBlockingStore.types.ts:60](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L60)

#### Parameters

##### scope

`string`

#### Returns

readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

***

### clearAllBlockers

> **clearAllBlockers**: `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:61](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L61)

***

### clearBlockersForScope

> **clearBlockersForScope**: (`scope`) => `void`

Defined in: [store/uiBlockingStore.types.ts:62](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L62)

#### Parameters

##### scope

`string`

#### Returns

`void`

***

### observeBlockingEvents

> **observeBlockingEvents**: (`observer`) => `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:64](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L64)

Observe lifecycle transitions through an anonymous, ownership-safe lease.

#### Parameters

##### observer

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`VoidFunction`
