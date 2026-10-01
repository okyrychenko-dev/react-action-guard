[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / createTypedHooks

# Function: createTypedHooks()

> **createTypedHooks**\<`TScope`\>(): [`TypedHooks`](../interfaces/TypedHooks.md)\<`TScope`\>

Defined in: [createTypedHooks.ts:65](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/createTypedHooks.ts#L65)

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
const { useActionBlocker, useIsBlocked, useAsyncAction } = createTypedHooks<AppScopes>();

// Now TypeScript will catch typos
useActionBlocker("id", { scope: "form" }); // ✓ OK
useActionBlocker("id", { scope: "typo" }); // ✗ Type error!
```
