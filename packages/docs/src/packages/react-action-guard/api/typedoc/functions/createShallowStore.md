[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / createShallowStore

# Function: createShallowStore()

> **createShallowStore**\<`TState`, `TMutators`\>(`storeCreator`): [`ShallowStoreBindings`](../interfaces/ShallowStoreBindings.md)\<`TState`\>

Defined in: node\_modules/@okyrychenko-dev/react-zustand-toolkit/dist/index.d.ts:112

Creates a Zustand store with automatic shallow comparison for all selectors

## Type Parameters

### TState

`TState`

The shape of your store state

### TMutators

`TMutators` *extends* \[keyof `StoreMutators`\<`TState`, `TState`\>, `unknown`\][] = \[\]

Array of mutators (middleware) applied to the store

## Parameters

### storeCreator

`MutatorsStateCreator`\<`TState`, `TMutators`\>

Function that creates the store state and actions

## Returns

[`ShallowStoreBindings`](../interfaces/ShallowStoreBindings.md)\<`TState`\>

Object with useStore hook (with shallow comparison) and useStoreApi
