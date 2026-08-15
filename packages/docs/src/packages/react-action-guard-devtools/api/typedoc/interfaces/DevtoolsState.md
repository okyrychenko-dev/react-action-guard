[**React Action Guard DevTools API v0.1.2**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsState

# Interface: DevtoolsState

Defined in: [src/types/devtools.types.ts:53](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L53)

Devtools store state

## Properties

### events

> **events**: [`DevtoolsEvent`](DevtoolsEvent.md)[]

Defined in: [src/types/devtools.types.ts:55](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L55)

Event history

***

### maxEvents

> **maxEvents**: `number`

Defined in: [src/types/devtools.types.ts:57](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L57)

Maximum number of events to keep

***

### isOpen

> **isOpen**: `boolean`

Defined in: [src/types/devtools.types.ts:59](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L59)

Whether the panel is open

***

### isMinimized

> **isMinimized**: `boolean`

Defined in: [src/types/devtools.types.ts:61](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L61)

Whether the panel is minimized

***

### activeTab

> **activeTab**: `"timeline"` \| `"blockers"`

Defined in: [src/types/devtools.types.ts:63](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L63)

Active tab in the panel

***

### filter

> **filter**: [`DevtoolsFilter`](DevtoolsFilter.md)

Defined in: [src/types/devtools.types.ts:65](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L65)

Current filter settings

***

### selectedEventId

> **selectedEventId**: `string` \| `null`

Defined in: [src/types/devtools.types.ts:67](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L67)

Selected event for detail view

***

### isPaused

> **isPaused**: `boolean`

Defined in: [src/types/devtools.types.ts:69](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/types/devtools.types.ts#L69)

Whether devtools is paused (stops recording)
