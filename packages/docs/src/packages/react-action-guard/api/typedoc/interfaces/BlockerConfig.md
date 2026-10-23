[**React Action Guard API v2.1.0**](../README.md)

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

Defined in: [store/uiBlockingStore.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L21)

Remove after a positive finite delay in milliseconds, using bounded timer chunks.
Omitted, zero and finite negative values disable expiration. Invalid/nonfinite values
or a deadline beyond Number.MAX_SAFE_INTEGER throw RangeError before mutation.

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:23](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L23)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
