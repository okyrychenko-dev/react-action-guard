[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useResolvedValue

# Function: useResolvedValue()

> **useResolvedValue**\<`T`\>(`selector`): `T`

Defined in: [context/useResolvedStore.ts:42](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/context/useResolvedStore.ts#L42)

Hook to use the resolved store with a selector

Automatically applies shallow comparison to prevent unnecessary re-renders.

## Type Parameters

### T

`T`

## Parameters

### selector

(`state`) => `T`

Selector function to pick state from the store

## Returns

`T`

Selected state value
