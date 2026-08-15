[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / StoreProviderProps

# Interface: StoreProviderProps\<TState\>

Defined in: [types/index.ts:46](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L46)

Props for generated provider component

## Extends

- [`StoreProviderConfig`](StoreProviderConfig.md)\<`TState`\>

## Type Parameters

### TState

`TState` = `unknown`

## Properties

### onStoreInit()?

> `optional` **onStoreInit**: (`store`) => `void`

Defined in: [types/index.ts:45](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L45)

Pure synchronous initialization hook invoked when the store instance is created.
This callback must stay idempotent and side-effect free.

#### Parameters

##### store

`StoreApi`\<`TState`\>

#### Returns

`void`

#### Inherited from

[`StoreProviderConfig`](StoreProviderConfig.md).[`onStoreInit`](StoreProviderConfig.md#onstoreinit)

***

### onStoreReady()?

> `optional` **onStoreReady**: (`store`) => `void`

Defined in: [types/index.ts:49](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L49)

Post-commit lifecycle hook for side effects that need a ready store instance.

#### Parameters

##### store

`StoreApi`\<`TState`\>

#### Returns

`void`

#### Inherited from

[`StoreProviderConfig`](StoreProviderConfig.md).[`onStoreReady`](StoreProviderConfig.md#onstoreready)

***

### onStoreCreate()?

> `optional` **onStoreCreate**: (`store`) => `void`

Defined in: [types/index.ts:53](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L53)

Deprecated alias for `onStoreReady`.

#### Parameters

##### store

`StoreApi`\<`TState`\>

#### Returns

`void`

#### Inherited from

[`StoreProviderConfig`](StoreProviderConfig.md).[`onStoreCreate`](StoreProviderConfig.md#onstorecreate)

***

### children

> **children**: `ReactNode`

Defined in: [types/index.ts:47](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L47)
