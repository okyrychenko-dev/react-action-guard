[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / StoreProviderConfig

# Interface: StoreProviderConfig\<TState\>

Defined in: [types/index.ts:25](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/types/index.ts#L25)

Configuration for store provider

## Extended by

- [`StoreProviderProps`](StoreProviderProps.md)

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
