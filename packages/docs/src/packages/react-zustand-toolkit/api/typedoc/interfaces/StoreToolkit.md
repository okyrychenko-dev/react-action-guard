[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / StoreToolkit

# Interface: StoreToolkit\<TState\>

Defined in: [types/index.ts:82](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L82)

Combined result with both global and provider capabilities

## Extends

- [`ShallowStoreBindings`](ShallowStoreBindings.md)\<`TState`\>

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

#### Inherited from

[`ShallowStoreBindings`](ShallowStoreBindings.md).[`useStore`](ShallowStoreBindings.md#usestore)

***

### useStoreApi

> **useStoreApi**: `StoreApi`\<`TState`\>

Defined in: [types/index.ts:19](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L19)

Direct access to store API for advanced usage

#### Inherited from

[`ShallowStoreBindings`](ShallowStoreBindings.md).[`useStoreApi`](ShallowStoreBindings.md#usestoreapi)

***

### createProvider()

> **createProvider**: () => [`StoreProviderResult`](StoreProviderResult.md)\<`TState`\>

Defined in: [types/index.ts:86](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L86)

Create provider for isolated store instances

#### Returns

[`StoreProviderResult`](StoreProviderResult.md)\<`TState`\>

***

### useResolvedStore()

> **useResolvedStore**: () => `StoreApi`\<`TState`\>

Defined in: [types/index.ts:90](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L90)

Hook that resolves to context store if inside provider, otherwise global store

#### Returns

`StoreApi`\<`TState`\>

***

### useResolvedStoreWithSelector()

> **useResolvedStoreWithSelector**: \{(): `TState`; \<`T`\>(`selector`): `T`; \}

Defined in: [types/index.ts:94](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L94)

Hook that resolves store and applies selector with shallow comparison

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
