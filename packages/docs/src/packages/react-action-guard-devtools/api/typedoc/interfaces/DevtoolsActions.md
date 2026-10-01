[**React Action Guard DevTools API v0.3.0**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsActions

# Interface: DevtoolsActions

Defined in: [types/devtools.types.ts:96](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L96)

Devtools store actions

## Properties

### addEvent

> **addEvent**: (`event`) => `void`

Defined in: [types/devtools.types.ts:98](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L98)

Add a new event to history

#### Parameters

##### event

`Omit`\<[`DevtoolsEvent`](DevtoolsEvent.md), `"id"`\>

#### Returns

`void`

***

### clearEvents

> **clearEvents**: `VoidFunction`

Defined in: [types/devtools.types.ts:100](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L100)

Clear all events

***

### toggleOpen

> **toggleOpen**: `VoidFunction`

Defined in: [types/devtools.types.ts:102](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L102)

Toggle panel open/closed

***

### setOpen

> **setOpen**: (`open`) => `void`

Defined in: [types/devtools.types.ts:104](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L104)

Set panel open state

#### Parameters

##### open

`boolean`

#### Returns

`void`

***

### toggleMinimized

> **toggleMinimized**: `VoidFunction`

Defined in: [types/devtools.types.ts:106](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L106)

Toggle minimized state

***

### setActiveTab

> **setActiveTab**: (`tab`) => `void`

Defined in: [types/devtools.types.ts:108](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L108)

Set active tab

#### Parameters

##### tab

`"timeline"` \| `"blockers"` \| `"stats"`

#### Returns

`void`

***

### setFilter

> **setFilter**: (`filter`) => `void`

Defined in: [types/devtools.types.ts:110](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L110)

Update filter settings

#### Parameters

##### filter

`Partial`\<[`DevtoolsFilter`](DevtoolsFilter.md)\>

#### Returns

`void`

***

### resetFilter

> **resetFilter**: `VoidFunction`

Defined in: [types/devtools.types.ts:112](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L112)

Reset filters to default

***

### selectEvent

> **selectEvent**: (`eventId`) => `void`

Defined in: [types/devtools.types.ts:114](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L114)

Select an event for detail view

#### Parameters

##### eventId

`Nullable`\<`string`\>

#### Returns

`void`

***

### togglePause

> **togglePause**: `VoidFunction`

Defined in: [types/devtools.types.ts:116](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L116)

Toggle pause state

***

### setMaxEvents

> **setMaxEvents**: (`max`) => `void`

Defined in: [types/devtools.types.ts:118](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L118)

Set max events limit

#### Parameters

##### max

`number`

#### Returns

`void`
