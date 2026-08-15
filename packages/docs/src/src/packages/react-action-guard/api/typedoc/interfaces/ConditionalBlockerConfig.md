[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / ConditionalBlockerConfig

# Interface: ConditionalBlockerConfig\<TState\>

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L9)

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

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L11)

Required scope(s) to block. Unlike base BlockerConfig, this is mandatory for conditional blockers.

***

### condition()

> **condition**: (`state?`) => `boolean`

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts:13](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L13)

Function that determines whether blocking should be active

#### Parameters

##### state?

`TState`

#### Returns

`boolean`

***

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L15)

Interval in milliseconds to check the condition (default: 1000ms)

***

### state?

> `optional` **state**: `TState`

Defined in: [src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useConditionalBlocker/useConditionalBlocker.types.ts#L17)

Optional state to pass to the condition function

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/store/uiBlockingStore.types.ts:41](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L41)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`reason`](BlockerConfig.md#reason)

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:43](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L43)

Priority level (negative values are normalized to 0)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`priority`](BlockerConfig.md#priority)

***

### timestamp?

> `optional` **timestamp**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:44](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L44)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timestamp`](BlockerConfig.md#timestamp)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:46](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L46)

Automatically remove the blocker after N milliseconds

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timeout`](BlockerConfig.md#timeout)

***

### onTimeout()?

> `optional` **onTimeout**: (`blockerId`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:48](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L48)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`onTimeout`](BlockerConfig.md#ontimeout)
