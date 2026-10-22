[**React Action Guard API v2.1.0**](../README.md)

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

### replaceBlocker

> **replaceBlocker**: (`id`, `config`) => `void`

Defined in: [store/uiBlockingStore.types.ts:64](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L64)

Advanced supported action: replace configuration for one owned registration.
Omitted scope/reason/priority use defaults; omitted timeout/onTimeout clear them.
Existing registration identity and timestamp remain unless timestamp is supplied.
Unchanged timeout preserves its deadline; changed timeout restarts or cancels it.
A missing ID is added. Does not transfer ownership or provide collision safety.

#### Parameters

##### id

`string`

##### config

[`BlockerConfig`](BlockerConfig.md)

#### Returns

`void`

***

### removeBlocker

> **removeBlocker**: (`id`) => `void`

Defined in: [store/uiBlockingStore.types.ts:65](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L65)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### isBlocked

> **isBlocked**: (`scope?`) => `boolean`

Defined in: [store/uiBlockingStore.types.ts:66](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L66)

#### Parameters

##### scope?

`string` \| readonly `string`[]

#### Returns

`boolean`

***

### getBlockingInfo

> **getBlockingInfo**: (`scope`) => readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

Defined in: [store/uiBlockingStore.types.ts:67](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L67)

#### Parameters

##### scope

`string`

#### Returns

readonly `Readonly`\<[`BlockerInfo`](BlockerInfo.md)\>[]

***

### clearAllBlockers

> **clearAllBlockers**: `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:68](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L68)

***

### clearBlockersForScope

> **clearBlockersForScope**: (`scope`) => `void`

Defined in: [store/uiBlockingStore.types.ts:69](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L69)

#### Parameters

##### scope

`string`

#### Returns

`void`

***

### observeBlockingEvents

> **observeBlockingEvents**: (`observer`) => `VoidFunction`

Defined in: [store/uiBlockingStore.types.ts:71](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L71)

Observe lifecycle transitions through an anonymous, ownership-safe lease.

#### Parameters

##### observer

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`VoidFunction`
