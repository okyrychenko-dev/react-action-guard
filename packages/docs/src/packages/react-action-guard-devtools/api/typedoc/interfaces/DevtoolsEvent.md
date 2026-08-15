[**React Action Guard DevTools API v0.1.2**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsEvent

# Interface: DevtoolsEvent

Defined in: [src/types/devtools.types.ts:6](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L6)

Extended event stored in devtools history

## Properties

### id

> **id**: `string`

Defined in: [src/types/devtools.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L8)

Unique event identifier

***

### action

> **action**: `BlockingAction`

Defined in: [src/types/devtools.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L10)

The action that occurred

***

### blockerId

> **blockerId**: `string`

Defined in: [src/types/devtools.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L12)

ID of the blocker

***

### config?

> `optional` **config**: `object`

Defined in: [src/types/devtools.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L14)

Blocker configuration at time of event

#### scope?

> `optional` **scope**: `string` \| readonly `string`[]

#### reason?

> `optional` **reason**: `string`

#### priority?

> `optional` **priority**: `number`

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/devtools.types.ts:20](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L20)

Unix timestamp of the event

***

### prevState?

> `optional` **prevState**: `object`

Defined in: [src/types/devtools.types.ts:22](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L22)

Previous state (available on remove/update)

#### scope?

> `optional` **scope**: `string` \| readonly `string`[]

#### reason?

> `optional` **reason**: `string`

#### priority?

> `optional` **priority**: `number`

***

### duration?

> `optional` **duration**: `number`

Defined in: [src/types/devtools.types.ts:28](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L28)

Duration in ms (calculated for remove events)

***

### source?

> `optional` **source**: `string`

Defined in: [src/types/devtools.types.ts:30](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L30)

Source of the blocking action
