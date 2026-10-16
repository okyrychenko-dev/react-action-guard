[**React Action Guard API v2.0.0**](../README.md)

***

[React Action Guard API](../README.md) / BlockerInfo

# Interface: BlockerInfo

Defined in: [store/uiBlockingStore.types.ts:32](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L32)

Complete blocker information including its unique identifier.

## Since

0.6.0

## Properties

### id

> `readonly` **id**: `string`

Defined in: [store/uiBlockingStore.types.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L33)

***

### scope

> `readonly` **scope**: `string` \| readonly `string`[]

Defined in: [store/uiBlockingStore.types.ts:34](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L34)

***

### reason

> `readonly` **reason**: `string`

Defined in: [store/uiBlockingStore.types.ts:35](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L35)

***

### priority

> `readonly` **priority**: `number`

Defined in: [store/uiBlockingStore.types.ts:36](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L36)

***

### timestamp

> `readonly` **timestamp**: `number`

Defined in: [store/uiBlockingStore.types.ts:37](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L37)

***

### timeout?

> `readonly` `optional` **timeout?**: `number`

Defined in: [store/uiBlockingStore.types.ts:38](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L38)

***

### onTimeout?

> `readonly` `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:39](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L39)

#### Parameters

##### blockerId

`string`

#### Returns

`void`
