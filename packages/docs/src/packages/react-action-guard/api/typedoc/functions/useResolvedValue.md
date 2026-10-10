[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useResolvedValue

# Function: useResolvedValue()

> **useResolvedValue**\<`T`\>(`selector`, `equalityFn?`): `T`

Defined in: [context/useResolvedStore.ts:34](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/context/useResolvedStore.ts#L34)

Hook to use the resolved store with a selector

Uses toolkit shallow comparison by default, or the supplied domain equality.

## Type Parameters

### T

`T`

## Parameters

### selector

(`state`) => `T`

Selector function to pick state from the store

### equalityFn?

(`left`, `right`) => `boolean`

Optional comparison retaining equivalent selected values

## Returns

`T`

Selected state value
