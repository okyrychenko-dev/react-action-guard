[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / BlockerConfig

# Interface: BlockerConfig

Defined in: [store/uiBlockingStore.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L10)

Configuration options for creating or updating a blocker.

## Since

0.6.0

## Extended by

- [`ConfirmableBlockerConfig`](ConfirmableBlockerConfig.md)
- [`ScheduledBlockerConfig`](ScheduledBlockerConfig.md)

## Properties

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [store/uiBlockingStore.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L11)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [store/uiBlockingStore.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L12)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [store/uiBlockingStore.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L14)

Priority level (negative values are normalized to 0)

***

### timestamp?

> `optional` **timestamp?**: `number`

Defined in: [store/uiBlockingStore.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L15)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [store/uiBlockingStore.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L17)

Automatically remove the blocker after N milliseconds

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L19)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
