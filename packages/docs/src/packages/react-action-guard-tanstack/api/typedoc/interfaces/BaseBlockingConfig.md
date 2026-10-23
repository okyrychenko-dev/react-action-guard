[**React Action Guard TanStack API v0.4.1**](../README.md)

***

[React Action Guard TanStack API](../README.md) / BaseBlockingConfig

# Interface: BaseBlockingConfig

Defined in: [packages/tanstack/src/types/common.types.ts:2](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L2)

Shared blocking options.

## Extended by

- [`QueryBlockingConfig`](QueryBlockingConfig.md)
- [`InfiniteQueryBlockingConfig`](InfiniteQueryBlockingConfig.md)
- [`QueriesBlockingConfig`](QueriesBlockingConfig.md)

## Properties

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [packages/tanstack/src/types/common.types.ts:3](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L3)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:4](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L4)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [packages/tanstack/src/types/common.types.ts:5](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L5)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:6](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L6)

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [packages/tanstack/src/types/common.types.ts:7](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L7)

#### Parameters

##### blockerId

`string`

#### Returns

`void`
