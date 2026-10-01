[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / scopeMatchesTarget

# Function: scopeMatchesTarget()

> **scopeMatchesTarget**(`blockerScope`, `targetScope`): `boolean`

Defined in: [store/scope/scope.utils.ts:110](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/scope/scope.utils.ts#L110)

Checks targeted-clear semantics.
Global blockers never match a target, including the global target; otherwise any shared scope
is a match.

## Parameters

### blockerScope

[`Scope`](../type-aliases/Scope.md)

### targetScope

[`Scope`](../type-aliases/Scope.md)

## Returns

`boolean`
