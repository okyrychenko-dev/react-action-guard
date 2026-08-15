[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / StoreProviderResult

# Interface: StoreProviderResult\<TState\>

Defined in: [types/index.ts:53](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L53)

Result of createStoreProvider factory

## Type Parameters

### TState

`TState`

## Properties

### Provider()

> **Provider**: (`props`) => `ReactNode`

Defined in: [types/index.ts:57](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L57)

Provider component to wrap your app/subtree

#### Parameters

##### props

[`StoreProviderProps`](StoreProviderProps.md)\<`TState`\>

#### Returns

`ReactNode`

***

### useContext()

> **useContext**: () => `StoreApi`\<`TState`\>

Defined in: [types/index.ts:61](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L61)

Hook to access store from context (throws if outside provider)

#### Returns

`StoreApi`\<`TState`\>

***

### useContextStore()

> **useContextStore**: \{(): `TState`; \<`T`\>(`selector`): `T`; \}

Defined in: [types/index.ts:65](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L65)

Hook to access store with selector from context

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

### useIsInsideProvider()

> **useIsInsideProvider**: () => `boolean`

Defined in: [types/index.ts:72](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L72)

Check if component is inside provider

#### Returns

`boolean`

***

### useOptionalContext()

> **useOptionalContext**: () => `StoreApi`\<`TState`\> \| `null`

Defined in: [types/index.ts:76](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L76)

Hook to access store from context (returns null if outside provider)

#### Returns

`StoreApi`\<`TState`\> \| `null`
