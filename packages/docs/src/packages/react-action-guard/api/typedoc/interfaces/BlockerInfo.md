[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / BlockerInfo

# Interface: BlockerInfo

Defined in: [store/uiBlockingStore.types.ts:28](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L28)

Complete blocker information including its unique identifier.

## Since

0.6.0

## Properties

### id

> `readonly` **id**: `string`

Defined in: [store/uiBlockingStore.types.ts:29](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L29)

***

### scope

> `readonly` **scope**: `string` \| readonly `string`[]

Defined in: [store/uiBlockingStore.types.ts:30](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L30)

***

### reason

> `readonly` **reason**: `string`

Defined in: [store/uiBlockingStore.types.ts:31](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L31)

***

### priority

> `readonly` **priority**: `number`

Defined in: [store/uiBlockingStore.types.ts:32](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L32)

***

### timestamp

> `readonly` **timestamp**: `number`

Defined in: [store/uiBlockingStore.types.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L33)

***

### timeout?

> `readonly` `optional` **timeout?**: `number`

Defined in: [store/uiBlockingStore.types.ts:34](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L34)

***

### onTimeout?

> `readonly` `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:35](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L35)

#### Parameters

##### blockerId

`string`

#### Returns

`void`
