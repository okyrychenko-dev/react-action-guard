[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / createResolvedStoreHooks

# Function: createResolvedStoreHooks()

> **createResolvedStoreHooks**\<`TState`\>(`globalStoreApi`, `useContextStore`): `object`

Defined in: [hooks/createResolvedStoreHooks.ts:17](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/hooks/createResolvedStoreHooks.ts#L17)

Creates hooks that resolve between context store and global store

This pattern allows components to work seamlessly both inside and outside a provider:
- Inside provider: uses isolated store from context
- Outside provider: falls back to global singleton store

## Type Parameters

### TState

`TState`

The shape of your store state

## Parameters

### globalStoreApi

`StoreApi`\<`TState`\>

The global singleton store API

### useContextStore

() => `StoreApi`\<`TState`\> \| `null`

Hook that returns store from context (or null if outside provider)

## Returns

`object`

Hooks for resolved store access

### useResolvedStore()

> **useResolvedStore**: () => `StoreApi`\<`TState`\>

#### Returns

`StoreApi`\<`TState`\>

### useResolvedStoreWithSelector()

> **useResolvedStoreWithSelector**: \{(): `TState`; \<`T`\>(`selector`): `T`; \}

#### Call Signature

> (): `TState`

##### Returns

`TState`

#### Call Signature

> \<`T`\>(`selector`): `T`

##### Type Parameters

###### T

`T`

##### Parameters

###### selector

(`state`) => `T`

##### Returns

`T`
