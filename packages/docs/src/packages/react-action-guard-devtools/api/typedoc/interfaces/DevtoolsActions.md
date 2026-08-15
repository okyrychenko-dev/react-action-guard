[**React Action Guard DevTools API v0.1.2**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsActions

# Interface: DevtoolsActions

Defined in: [src/types/devtools.types.ts:75](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L75)

Devtools store actions

## Properties

### addEvent()

> **addEvent**: (`event`) => `void`

Defined in: [src/types/devtools.types.ts:77](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L77)

Add a new event to history

#### Parameters

##### event

`Omit`\<[`DevtoolsEvent`](DevtoolsEvent.md), `"id"`\>

#### Returns

`void`

***

### clearEvents

> **clearEvents**: `VoidFunction`

Defined in: [src/types/devtools.types.ts:79](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L79)

Clear all events

***

### toggleOpen

> **toggleOpen**: `VoidFunction`

Defined in: [src/types/devtools.types.ts:81](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L81)

Toggle panel open/closed

***

### setOpen()

> **setOpen**: (`open`) => `void`

Defined in: [src/types/devtools.types.ts:83](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L83)

Set panel open state

#### Parameters

##### open

`boolean`

#### Returns

`void`

***

### toggleMinimized

> **toggleMinimized**: `VoidFunction`

Defined in: [src/types/devtools.types.ts:85](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L85)

Toggle minimized state

***

### setActiveTab()

> **setActiveTab**: (`tab`) => `void`

Defined in: [src/types/devtools.types.ts:87](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L87)

Set active tab

#### Parameters

##### tab

`"timeline"` | `"blockers"`

#### Returns

`void`

***

### setFilter()

> **setFilter**: (`filter`) => `void`

Defined in: [src/types/devtools.types.ts:89](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L89)

Update filter settings

#### Parameters

##### filter

`Partial`\<[`DevtoolsFilter`](DevtoolsFilter.md)\>

#### Returns

`void`

***

### resetFilter

> **resetFilter**: `VoidFunction`

Defined in: [src/types/devtools.types.ts:91](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L91)

Reset filters to default

***

### selectEvent()

> **selectEvent**: (`eventId`) => `void`

Defined in: [src/types/devtools.types.ts:93](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L93)

Select an event for detail view

#### Parameters

##### eventId

`string` | `null`

#### Returns

`void`

***

### togglePause

> **togglePause**: `VoidFunction`

Defined in: [src/types/devtools.types.ts:95](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L95)

Toggle pause state

***

### setMaxEvents()

> **setMaxEvents**: (`max`) => `void`

Defined in: [src/types/devtools.types.ts:97](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L97)

Set max events limit

#### Parameters

##### max

`number`

#### Returns

`void`
