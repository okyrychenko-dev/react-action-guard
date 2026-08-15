[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / BlockerInfo

# Interface: BlockerInfo

Defined in: [src/store/uiBlockingStore.types.ts:95](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L95)

Complete blocker information including its unique identifier.

This type extends StoredBlocker with the blocker's ID, making it
suitable for reading and displaying blocker information. Returned by
[UIBlockingStoreActions.getBlockingInfo](UIBlockingStoreActions.md#getblockinginfo) and used by [useBlockingInfo](../functions/useBlockingInfo.md).

## Example

Accessing blocker info
```ts
const blockers: BlockerInfo[] = store.getState().getBlockingInfo('form');
blockers.forEach(blocker => {
  console.log(`${blocker.id}: ${blocker.reason} (priority: ${blocker.priority})`);
});
```

## Since

0.6.0

## Properties

### scope

> **scope**: `string` \| readonly `string`[]

Defined in: [src/store/uiBlockingStore.types.ts:64](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L64)

#### Inherited from

`StoredBlocker.scope`

***

### reason

> **reason**: `string`

Defined in: [src/store/uiBlockingStore.types.ts:65](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L65)

#### Inherited from

`StoredBlocker.reason`

***

### priority

> **priority**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:66](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L66)

#### Inherited from

`StoredBlocker.priority`

***

### timestamp

> **timestamp**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:67](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L67)

#### Inherited from

`StoredBlocker.timestamp`

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:69](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L69)

Timeout duration in milliseconds (if set)

#### Inherited from

`StoredBlocker.timeout`

***

### timeoutId?

> `optional` **timeoutId**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:71](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L71)

Internal timeout ID for cleanup

#### Inherited from

`StoredBlocker.timeoutId`

***

### onTimeout()?

> `optional` **onTimeout**: (`blockerId`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:73](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L73)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

`StoredBlocker.onTimeout`

***

### id

> **id**: `string`

Defined in: [src/store/uiBlockingStore.types.ts:96](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L96)
