[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / BlockingSchedule

# Interface: BlockingSchedule

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L12)

Schedule configuration for time-based blocking.

You can specify the blocking period in two ways:
1. start + duration: Block for a specific duration after start time
2. start + end: Block between start and end times

Note: If both duration and end are provided, duration takes precedence.

## Properties

### start

> **start**: `string` \| `number` \| `Date`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L14)

Start time as ISO string, Date object, or timestamp

***

### end?

> `optional` **end**: `string` \| `number` \| `Date`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L16)

Optional end time as ISO string, Date object, or timestamp

***

### duration?

> `optional` **duration**: `number`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L18)

Duration in milliseconds (takes precedence over end if both provided)
