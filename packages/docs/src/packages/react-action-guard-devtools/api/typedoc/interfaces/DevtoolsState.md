[**React Action Guard DevTools API v0.3.0**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsState

# Interface: DevtoolsState

Defined in: [types/devtools.types.ts:74](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L74)

Devtools store state

## Properties

### events

> **events**: [`DevtoolsEvent`](DevtoolsEvent.md)[]

Defined in: [types/devtools.types.ts:76](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L76)

Event history

***

### maxEvents

> **maxEvents**: `number`

Defined in: [types/devtools.types.ts:78](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L78)

Maximum number of events to keep

***

### isOpen

> **isOpen**: `boolean`

Defined in: [types/devtools.types.ts:80](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L80)

Whether the panel is open

***

### isMinimized

> **isMinimized**: `boolean`

Defined in: [types/devtools.types.ts:82](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L82)

Whether the panel is minimized

***

### activeTab

> **activeTab**: `"timeline"` \| `"blockers"` \| `"stats"`

Defined in: [types/devtools.types.ts:84](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L84)

Active tab in the panel

***

### filter

> **filter**: [`DevtoolsFilter`](DevtoolsFilter.md)

Defined in: [types/devtools.types.ts:86](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L86)

Current filter settings

***

### selectedEventId

> **selectedEventId**: `Nullable`\<`string`\>

Defined in: [types/devtools.types.ts:88](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L88)

Selected event for detail view

***

### isPaused

> **isPaused**: `boolean`

Defined in: [types/devtools.types.ts:90](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/types/devtools.types.ts#L90)

Whether devtools is paused (stops recording)
