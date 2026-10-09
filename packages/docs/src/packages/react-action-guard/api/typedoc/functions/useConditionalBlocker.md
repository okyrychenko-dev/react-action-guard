[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useConditionalBlocker

# Function: useConditionalBlocker()

> **useConditionalBlocker**\<`TState`\>(`blockerId`, `config`): `void`

Defined in: [hooks/useConditionalBlocker/useConditionalBlocker.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConditionalBlocker/useConditionalBlocker.ts#L18)

Blocks UI based on a dynamic condition that is periodically evaluated.

## Type Parameters

### TState

`TState` = `unknown`

## Parameters

### blockerId

`string`

### config

[`ConditionalBlockerConfig`](../interfaces/ConditionalBlockerConfig.md)\<`TState`\>

## Returns

`void`

## Since

0.6.0

## See

 - [useActionBlocker](useActionBlocker.md) for simple conditional blocking with boolean
 - [useScheduledBlocker](useScheduledBlocker.md) for time-based blocking
 - [ConditionalBlockerConfig](../interfaces/ConditionalBlockerConfig.md) for configuration options
