[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / ShallowStoreBindings

# Interface: ShallowStoreBindings\<TState\>

Defined in: node\_modules/@okyrychenko-dev/react-zustand-toolkit/dist/index.d.ts:7

Store bindings with shallow comparison built-in

## Type Parameters

### TState

`TState`

## Properties

### useStore()

> **useStore**: \{(): `TState`; \<`T`\>(`selector`): `T`; \}

Defined in: node\_modules/@okyrychenko-dev/react-zustand-toolkit/dist/index.d.ts:12

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

Defined in: node\_modules/@okyrychenko-dev/react-zustand-toolkit/dist/index.d.ts:19

Direct access to store API for advanced usage
