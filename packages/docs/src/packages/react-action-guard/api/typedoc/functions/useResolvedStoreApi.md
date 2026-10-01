[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useResolvedStoreApi

# Function: useResolvedStoreApi()

> **useResolvedStoreApi**(): `StoreApi`\<[`UIBlockingStore`](../type-aliases/UIBlockingStore.md)\>

Defined in: [context/useResolvedStore.ts:27](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/context/useResolvedStore.ts#L27)

Hook that resolves to either the context store or global store

This hook automatically uses the store from UIBlockingProvider if available,
otherwise falls back to the global store. This enables both patterns:

1. Global store (default behavior, no Provider needed)
2. Context store (for SSR, testing, micro-frontends)

## Returns

`StoreApi`\<[`UIBlockingStore`](../type-aliases/UIBlockingStore.md)\>

The resolved store API
