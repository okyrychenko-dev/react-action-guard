[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / ScheduledBlockerConfig

# Interface: ScheduledBlockerConfig

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:24](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L24)

Configuration for scheduled blocker hook

## Extends

- [`BlockerConfig`](BlockerConfig.md)

## Properties

### schedule

> **schedule**: [`BlockingSchedule`](BlockingSchedule.md)

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:26](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L26)

Schedule defining when blocking should be active

***

### onScheduleStart?

> `optional` **onScheduleStart?**: `VoidFunction`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:28](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L28)

Optional callback to execute when the blocking schedule starts

***

### onScheduleEnd?

> `optional` **onScheduleEnd?**: `VoidFunction`

Defined in: [hooks/useScheduledBlocker/useScheduledBlocker.types.ts:30](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useScheduledBlocker/useScheduledBlocker.types.ts#L30)

Optional callback to execute when the blocking schedule ends

***

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [store/uiBlockingStore.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L11)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`scope`](BlockerConfig.md#scope)

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

Defined in: [store/uiBlockingStore.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L17)

Automatically remove the blocker after N milliseconds

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timeout`](BlockerConfig.md#timeout)

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L19)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`onTimeout`](BlockerConfig.md#ontimeout)
