[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / createTypedHooks

# Function: createTypedHooks()

> **createTypedHooks**\<`TScope`\>(): [`TypedHooks`](../interfaces/TypedHooks.md)\<`TScope`\>

Defined in: [src/createTypedHooks.ts:55](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/createTypedHooks.ts#L55)

Creates type-safe versions of all blocking hooks with your custom scope types

## Type Parameters

### TScope

`TScope` *extends* `string`

Union type of allowed scope strings

## Returns

[`TypedHooks`](../interfaces/TypedHooks.md)\<`TScope`\>

Object with type-safe hook functions

## Example

```typescript
// Define your app's scopes
type AppScopes = "global" | "form" | "navigation" | "checkout";

// Create typed hooks
const { useBlocker, useIsBlocked, useAsyncAction } = createTypedHooks<AppScopes>();

// Now TypeScript will catch typos
useBlocker("id", { scope: "form" }); // ✓ OK
useBlocker("id", { scope: "typo" }); // ✗ Type error!
```
