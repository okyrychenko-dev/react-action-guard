[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useScheduledBlocker

# Function: useScheduledBlocker()

> **useScheduledBlocker**(`blockerId`, `config`): `void`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.ts:25](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.ts#L25)

Schedules UI blocking for a specific time period (e.g., maintenance windows).

## Parameters

### blockerId

`string`

### config

[`ScheduledBlockerConfig`](../interfaces/ScheduledBlockerConfig.md)

## Returns

`void`

## Since

0.6.0

## See

 - [useActionBlocker](useActionBlocker.md) for immediate blocking without scheduling
 - [useConditionalBlocker](useConditionalBlocker.md) for condition-based blocking
 - [ScheduledBlockerConfig](../interfaces/ScheduledBlockerConfig.md) for configuration options
 - [BlockingSchedule](../interfaces/BlockingSchedule.md) for schedule specification details
