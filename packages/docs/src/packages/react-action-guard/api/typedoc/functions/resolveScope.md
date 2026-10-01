[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / resolveScope

# Function: resolveScope()

> **resolveScope**(`explicitScope?`, `inheritedScope?`): `Optional`\<[`Scope`](../type-aliases/Scope.md)\>

Defined in: [store/scope/scope.utils.ts:74](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/scope/scope.utils.ts#L74)

Resolves guarded-control inheritance.
An omitted or empty explicit scope inherits; any non-empty explicit scope wins.

## Parameters

### explicitScope?

[`Scope`](../type-aliases/Scope.md)

### inheritedScope?

[`Scope`](../type-aliases/Scope.md)

## Returns

`Optional`\<[`Scope`](../type-aliases/Scope.md)\>
