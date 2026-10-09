[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / BlockerConfigTyped

# Interface: BlockerConfigTyped\<TScope\>

Defined in: [types/scopes.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L14)

Type-safe blocker configuration with generic scope type

## Type Parameters

### TScope

`TScope` *extends* `string`

## Properties

### scope?

> `optional` **scope?**: [`ScopeValue`](../type-aliases/ScopeValue.md)\<`TScope`\>

Defined in: [types/scopes.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L16)

Scope(s) to block

***

### reason?

> `optional` **reason?**: `string`

Defined in: [types/scopes.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L18)

Human-readable reason for blocking

***

### priority?

> `optional` **priority?**: `number`

Defined in: [types/scopes.ts:20](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L20)

Reason ordering priority (minimum 0). Every matching active blocker retains protection, including lower-priority ones.

***

### timestamp?

> `optional` **timestamp?**: `number`

Defined in: [types/scopes.ts:22](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L22)

Timestamp when the blocker was created

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [types/scopes.ts:24](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L24)

Timeout in milliseconds after which the blocker will be automatically removed

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [types/scopes.ts:26](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/types/scopes.ts#L26)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
