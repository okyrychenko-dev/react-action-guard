[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / ScheduledBlockerConfig

# Interface: ScheduledBlockerConfig

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:24](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L24)

Configuration for scheduled blocker hook

## Extends

- [`BlockerConfig`](BlockerConfig.md)

## Properties

### schedule

> **schedule**: [`BlockingSchedule`](BlockingSchedule.md)

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:26](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L26)

Schedule defining when blocking should be active

***

### onScheduleStart?

> `optional` **onScheduleStart**: `VoidFunction`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:28](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L28)

Optional callback to execute when the blocking schedule starts

***

### onScheduleEnd?

> `optional` **onScheduleEnd**: `VoidFunction`

Defined in: [src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts:30](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L30)

Optional callback to execute when the blocking schedule ends

***

### scope?

> `optional` **scope**: `string` \| readonly `string`[]

Defined in: [src/store/uiBlockingStore.types.ts:40](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L40)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`scope`](BlockerConfig.md#scope)

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
