[**React Action Guard DevTools API v1.0.1**](../README.md)

***

[React Action Guard DevTools API](../README.md) / ActionGuardDevtoolsProps

# Interface: ActionGuardDevtoolsProps

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:36](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L36)

## Properties

### inspection?

> `optional` **inspection?**: [`DevtoolsInspection`](DevtoolsInspection.md)

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:38](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L38)

Optional declarations for scope and action explanations in this panel.

***

### position?

> `optional` **position?**: [`DevtoolsPosition`](../type-aliases/DevtoolsPosition.md)

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:40](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L40)

Position of the toggle button and panel

***

### defaultOpen?

> `optional` **defaultOpen?**: `boolean`

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:42](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L42)

Whether the panel is open by default

***

### maxEvents?

> `optional` **maxEvents?**: `number`

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:44](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L44)

Maximum number of events to store

***

### stuckThresholdMs?

> `optional` **stuckThresholdMs?**: `number`

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:49](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L49)

Age in milliseconds after which an active blocker is flagged as potentially
stuck (a likely missing `unblock()`), shown with a warning badge (default: 10000).

***

### showInProduction?

> `optional` **showInProduction?**: `boolean`

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:51](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L51)

Whether to show in production (default: false)

***

### store?

> `optional` **store?**: `UIBlockingStoreApi`

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:57](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L57)

Custom blocking store instance to observe instead of the global store.
Wrap the panel and adjacent `useDevtoolsStore` consumers in
`ActionGuardDevtoolsProvider` to expose this store's observation session.
