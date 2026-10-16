[**React Action Guard API v2.0.0**](../README.md)

***

[React Action Guard API](../README.md) / ConditionalBlockerConfig

# Interface: ConditionalBlockerConfig\<TState\>

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L9)

Configuration for conditional blocker hook.

Note: Unlike the base BlockerConfig, the scope property is required here
because conditional blockers must have a defined scope to check against.

## Extends

- `Omit`\<[`BlockerConfig`](BlockerConfig.md), `"scope"`\>

## Type Parameters

### TState

`TState` = `unknown`

## Properties

### scope

> **scope**: `string` \| readonly `string`[]

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L11)

Required scope(s) to block. Unlike base BlockerConfig, this is mandatory for conditional blockers.

***

### condition

> **condition**: (`state?`) => `boolean`

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.types.ts:13](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L13)

Function that determines whether blocking should be active

#### Parameters

##### state?

`TState`

#### Returns

`boolean`

***

### checkInterval?

> `optional` **checkInterval?**: `number`

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L15)

Interval in milliseconds to check the condition (default: 1000ms)

***

### state?

> `optional` **state?**: `TState`

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L17)

Optional state to pass to the condition function

***

### reason?

> `optional` **reason?**: `string`

Defined in: [store/uiBlockingStore.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L12)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`reason`](BlockerConfig.md#reason)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [store/uiBlockingStore.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L14)

Priority level (negative values are normalized to 0)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`priority`](BlockerConfig.md#priority)

***

### timestamp?

> `optional` **timestamp?**: `number`

Defined in: [store/uiBlockingStore.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L15)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timestamp`](BlockerConfig.md#timestamp)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [store/uiBlockingStore.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L21)

Remove after a positive finite delay in milliseconds, using bounded timer chunks.
Omitted, zero and finite negative values disable expiration. Invalid/nonfinite values
or a deadline beyond Number.MAX_SAFE_INTEGER throw RangeError before mutation.

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timeout`](BlockerConfig.md#timeout)

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

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`onTimeout`](BlockerConfig.md#ontimeout)
