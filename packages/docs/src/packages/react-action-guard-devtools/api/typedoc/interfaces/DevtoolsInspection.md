[**React Action Guard DevTools API v1.0.1**](../README.md)

***

[React Action Guard DevTools API](../README.md) / DevtoolsInspection

# Interface: DevtoolsInspection

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:29](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L29)

Store-local inspection declarations; they do not change blocking behavior.

## Properties

### scopes?

> `optional` **scopes?**: readonly `string`[]

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:31](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L31)

Include known areas even when no active blocker names them.

***

### actions?

> `optional` **actions?**: readonly [`DevtoolsInspectedAction`](DevtoolsInspectedAction.md)[]

Defined in: [components/actionGuardDevtools/ActionGuardDevtools.types.ts:33](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/devtools/src/components/actionGuardDevtools/ActionGuardDevtools.types.ts#L33)

Explain actions only through the scopes declared by the application.
