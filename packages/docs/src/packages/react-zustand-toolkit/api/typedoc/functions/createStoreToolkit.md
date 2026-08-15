[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / createStoreToolkit

# Function: createStoreToolkit()

> **createStoreToolkit**\<`TState`, `TMutators`\>(`storeCreator`, `options`): [`StoreToolkit`](../interfaces/StoreToolkit.md)\<`TState`\>

Defined in: [core/createStoreToolkit.ts:22](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/core/createStoreToolkit.ts#L22)

Creates a complete Zustand store toolkit with global store, provider, and resolution hooks

This is the all-in-one solution that combines:
- Global singleton store with shallow comparison
- Provider factory for isolated instances
- Smart hooks that resolve between global and context stores

## Type Parameters

### TState

`TState`

The shape of your store state

### TMutators

`TMutators` *extends* \[keyof `StoreMutators`\<`TState`, `TState`\>, `unknown`\][] = \[\]

Array of mutators (middleware) applied to the store

## Parameters

### storeCreator

[`MutatorsStateCreator`](../type-aliases/MutatorsStateCreator.md)\<`TState`, `TMutators`\>

Function that creates the store state and actions

### options

Configuration options

#### name?

`string`

Name for the store (used in DevTools and Provider)

## Returns

[`StoreToolkit`](../interfaces/StoreToolkit.md)\<`TState`\>

Complete toolkit with all hooks and utilities
