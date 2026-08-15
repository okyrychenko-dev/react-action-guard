[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / ShallowStoreBindings

# Interface: ShallowStoreBindings\<TState\>

Defined in: [types/index.ts:7](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L7)

Store bindings with shallow comparison built-in

## Extended by

- [`StoreToolkit`](StoreToolkit.md)

## Type Parameters

### TState

`TState`

## Properties

### useStore()

> **useStore**: \{(): `TState`; \<`T`\>(`selector`): `T`; \}

Defined in: [types/index.ts:12](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L12)

Hook to access store state with automatic shallow comparison
Can be used with or without selector

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

***

### useStoreApi

> **useStoreApi**: `StoreApi`\<`TState`\>

Defined in: [types/index.ts:19](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L19)

Direct access to store API for advanced usage
