[**React Action Guard TanStack API v0.2.3**](../README.md)

***

[React Action Guard TanStack API](../README.md) / BaseBlockingConfig

# Interface: BaseBlockingConfig

Defined in: [src/types/common.types.ts:5](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L5)

Base configuration shared by all blocking hooks.
Defines common properties for UI blocking behavior.

## Extended by

- [`QueryBlockingConfig`](QueryBlockingConfig.md)
- [`InfiniteQueryBlockingConfig`](InfiniteQueryBlockingConfig.md)
- [`QueriesBlockingConfig`](QueriesBlockingConfig.md)

## Properties

### scope?

> `optional` **scope**: `string` \| readonly `string`[]

Defined in: [src/types/common.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L10)

Scope(s) to block. Can be a single string or array of strings.
Use scopes to control which parts of your UI should be blocked.

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/types/common.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L15)

Priority level for this blocker.
Higher priority blockers take precedence when multiple blockers are active.

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/types/common.types.ts:20](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L20)

Default message for blocking states.
Can be overridden by specific state reasons.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/common.types.ts:25](https://github.com/okyrychenko-dev/react-action-guard-tanstack/blob/main/src/types/common.types.ts#L25)

Automatically remove the blocker after N milliseconds.
Useful for preventing stale blockers when requests hang.

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
