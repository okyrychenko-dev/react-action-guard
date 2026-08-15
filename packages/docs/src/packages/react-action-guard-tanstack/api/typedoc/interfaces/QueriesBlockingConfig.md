[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / QueriesBlockingConfig

# Interface: QueriesBlockingConfig

Defined in: [src/hooks/useBlockingQueries.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L8)

Configuration for queries blocking with dynamic reasons.
Supports different messages for loading, fetching, and error states.

## Extends

- [`BaseBlockingConfig`](BaseBlockingConfig.md)

## Properties

### onLoading?

> `optional` **onLoading**: `boolean`

Defined in: [src/hooks/useBlockingQueries.types.ts:13](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L13)

Whether to block during initial loading (default: true).
Set to false to skip blocking during the first data fetch.

***

### onFetching?

> `optional` **onFetching**: `boolean`

Defined in: [src/hooks/useBlockingQueries.types.ts:18](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L18)

Whether to block during background fetching (default: false).
Set to true to block when refetching data in the background.

***

### onError?

> `optional` **onError**: `boolean`

Defined in: [src/hooks/useBlockingQueries.types.ts:23](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L23)

Whether to block on error (default: false).
Set to true to keep UI blocked when any query fails.

***

### reasonOnLoading?

> `optional` **reasonOnLoading**: `string`

Defined in: [src/hooks/useBlockingQueries.types.ts:28](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L28)

Message to show during initial loading.
Falls back to `reason` if not specified.

***

### reasonOnFetching?

> `optional` **reasonOnFetching**: `string`

Defined in: [src/hooks/useBlockingQueries.types.ts:33](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L33)

Message to show during background fetching.
Falls back to `reason` if not specified.

***

### reasonOnError?

> `optional` **reasonOnError**: `string`

Defined in: [src/hooks/useBlockingQueries.types.ts:38](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/hooks/useBlockingQueries.types.ts#L38)

Message to show when any query fails.
Falls back to `reason` if not specified.

***

### scope?

> `optional` **scope**: `string` \| readonly `string`[]

Defined in: [src/types/common.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L10)

Scope(s) to block. Can be a single string or array of strings.
Use scopes to control which parts of your UI should be blocked.

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`scope`](BaseBlockingConfig.md#scope)

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/types/common.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L15)

Priority level for this blocker.
Higher priority blockers take precedence when multiple blockers are active.

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`priority`](BaseBlockingConfig.md#priority)

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/types/common.types.ts:20](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L20)

Default message for blocking states.
Can be overridden by specific state reasons.

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`reason`](BaseBlockingConfig.md#reason)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/common.types.ts:25](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L25)

Automatically remove the blocker after N milliseconds.
Useful for preventing stale blockers when requests hang.

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`timeout`](BaseBlockingConfig.md#timeout)

***

### onTimeout()?

> `optional` **onTimeout**: (`blockerId`) => `void`

Defined in: [src/types/common.types.ts:29](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L29)

Callback invoked when the blocker is automatically removed due to timeout.

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

[`BaseBlockingConfig`](BaseBlockingConfig.md).[`onTimeout`](BaseBlockingConfig.md#ontimeout)
