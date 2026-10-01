[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / BaseBlockingConfig

# Interface: BaseBlockingConfig

Defined in: [packages/tanstack/src/types/common.types.ts:4](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L4)

Shared blocking options.

## Extended by

- [`QueryBlockingConfig`](QueryBlockingConfig.md)
- [`InfiniteQueryBlockingConfig`](InfiniteQueryBlockingConfig.md)
- [`QueriesBlockingConfig`](QueriesBlockingConfig.md)

## Properties

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [packages/tanstack/src/types/common.types.ts:5](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L5)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:6](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L6)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [packages/tanstack/src/types/common.types.ts:7](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L7)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L8)

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [packages/tanstack/src/types/common.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L9)

#### Parameters

##### blockerId

`string`

#### Returns

`void`
