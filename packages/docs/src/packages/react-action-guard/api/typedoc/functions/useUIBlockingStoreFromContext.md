[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useUIBlockingStoreFromContext

# Function: useUIBlockingStoreFromContext()

## Call Signature

> **useUIBlockingStoreFromContext**(): [`UIBlockingStore`](../type-aliases/UIBlockingStore.md)

Defined in: [context/UIBlockingContext.tsx:36](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/context/UIBlockingContext.tsx#L36)

### Returns

[`UIBlockingStore`](../type-aliases/UIBlockingStore.md)

## Call Signature

> **useUIBlockingStoreFromContext**\<`T`\>(`selector`, `equalityFn?`): `T`

Defined in: [context/UIBlockingContext.tsx:37](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/context/UIBlockingContext.tsx#L37)

### Type Parameters

#### T

`T`

### Parameters

#### selector

(`state`) => `T`

#### equalityFn?

(`a`, `b`) => `boolean`

### Returns

`T`
