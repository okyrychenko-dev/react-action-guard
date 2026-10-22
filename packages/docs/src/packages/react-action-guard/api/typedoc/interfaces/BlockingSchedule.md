[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / BlockingSchedule

# Interface: BlockingSchedule

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L16)

Schedule configuration for time-based blocking.

You can specify the blocking period in two ways:
1. start + duration: Block for a specific duration after start time
2. start + end: Block between start and end times

Windows are half-open [start, end). Omit both duration and end for indefinite blocking.
Zero duration or equal bounds are empty and emit no schedule notifications.
Every supplied bound must be valid, even when duration takes precedence over end.
Negative/nonfinite duration, invalid dates, end before start and calculated end
outside the JavaScript Date range cancel the schedule with a development warning.

## Properties

### start

> **start**: `string` \| `number` \| `Date`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L18)

Start time as ISO string, Date object, or timestamp

***

### end?

> `optional` **end?**: `string` \| `number` \| `Date`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:20](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L20)

Optional end time as ISO string, Date object, or timestamp

***

### duration?

> `optional` **duration?**: `number`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:22](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L22)

Duration in milliseconds (takes precedence over end if both provided)
