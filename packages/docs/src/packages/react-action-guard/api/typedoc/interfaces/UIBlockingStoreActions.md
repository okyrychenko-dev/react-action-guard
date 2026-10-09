[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / UIBlockingStoreActions

# Interface: UIBlockingStoreActions

Defined in: [store/uiBlockingStore.types.ts:49](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L49)

All available actions for managing UI blocking state.

## Since

0.6.0

## Properties

### addBlocker

> **addBlocker**: (`id`, `config?`) => `void`

Defined in: [store/uiBlockingStore.types.ts:50](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L50)

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

Defined in: [store/uiBlockingStore.types.ts:51](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L51)

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

Defined in: [store/uiBlockingStore.types.ts:54](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L54)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### isBlocked

> **isBlocked**: (`scope?`) => `boolean`

Defined in: [store/uiBlockingStore.types.ts:55](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L55)

#### Parameters

##### scope?

`string` \| readonly `string`[]

#### Returns

`boolean`

***

### getBlockingInfo

> **getBlockingInfo**: (`scope`) => readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

Defined in: [store/uiBlockingStore.types.ts:56](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L56)

#### Parameters

##### scope

`string`

#### Returns

readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

***

### clearAllBlockers

> **clearAllBlockers**: `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:57](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L57)

***

### clearBlockersForScope

> **clearBlockersForScope**: (`scope`) => `void`

Defined in: [store/uiBlockingStore.types.ts:58](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L58)

#### Parameters

##### scope

`string`

#### Returns

`void`

***

### observeBlockingEvents

> **observeBlockingEvents**: (`observer`) => `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:60](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L60)

Observe lifecycle transitions through an anonymous, ownership-safe lease.

#### Parameters

##### observer

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`VoidFunction`
