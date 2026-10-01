[**React Action Guard DevTools API v0.3.0**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsEvent

# Interface: DevtoolsEvent

Defined in: [types/devtools.types.ts:7](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L7)

Extended event stored in devtools history

## Properties

### id

> **id**: `string`

Defined in: [types/devtools.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L9)

Unique event identifier

***

### action

> **action**: `BlockingAction`

Defined in: [types/devtools.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L11)

The action that occurred

***

### blockerId

> **blockerId**: `string`

Defined in: [types/devtools.types.ts:13](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L13)

ID of the blocker

***

### config?

> `optional` **config?**: `object`

Defined in: [types/devtools.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L15)

Blocker configuration at time of event

#### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

#### reason?

> `optional` **reason?**: `string`

#### priority?

> `optional` **priority?**: `number`

***

### timestamp

> **timestamp**: `number`

Defined in: [types/devtools.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L21)

Unix timestamp of the event

***

### prevState?

> `optional` **prevState?**: `object`

Defined in: [types/devtools.types.ts:23](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L23)

Previous state (available on remove/update)

#### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

#### reason?

> `optional` **reason?**: `string`

#### priority?

> `optional` **priority?**: `number`

***

### duration?

> `optional` **duration?**: `number`

Defined in: [types/devtools.types.ts:29](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L29)

Duration in ms (calculated for remove events)

***

### scope?

> `optional` **scope?**: `string`

Defined in: [types/devtools.types.ts:31](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L31)

Scope attached directly to middleware event (for clear_scope, etc.)

***

### count?

> `optional` **count?**: `number`

Defined in: [types/devtools.types.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L33)

Number of affected blockers for bulk actions
