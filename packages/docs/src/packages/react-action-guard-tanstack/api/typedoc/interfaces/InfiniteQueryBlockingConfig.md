[**React Action Guard TanStack API v0.3.5**](../README.md)

***

[React Action Guard TanStack API](../README.md) / InfiniteQueryBlockingConfig

# Interface: InfiniteQueryBlockingConfig

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L11)

Shared blocking options.

## Extends

- [`BaseBlockingConfig`](BaseBlockingConfig.md)

## Properties

### onLoading?

> `optional` **onLoading?**: `boolean`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L12)

***

### onFetching?

> `optional` **onFetching?**: `boolean`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:13](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L13)

***

### onError?

> `optional` **onError?**: `boolean`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L14)

***

### reasonOnLoading?

> `optional` **reasonOnLoading?**: `string`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L15)

***

### reasonOnFetching?

> `optional` **reasonOnFetching?**: `string`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L16)

***

### reasonOnError?

> `optional` **reasonOnError?**: `string`

Defined in: [packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/hooks/useBlockingInfiniteQuery.types.ts#L17)

***

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [packages/tanstack/src/types/common.types.ts:5](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L5)

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`scope`](BaseBlockingConfig.md#scope)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:6](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L6)

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`priority`](BaseBlockingConfig.md#priority)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [packages/tanstack/src/types/common.types.ts:7](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L7)

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`reason`](BaseBlockingConfig.md#reason)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [packages/tanstack/src/types/common.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L8)

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`timeout`](BaseBlockingConfig.md#timeout)

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [packages/tanstack/src/types/common.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/tanstack/src/types/common.types.ts#L9)

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`onTimeout`](BaseBlockingConfig.md#ontimeout)
