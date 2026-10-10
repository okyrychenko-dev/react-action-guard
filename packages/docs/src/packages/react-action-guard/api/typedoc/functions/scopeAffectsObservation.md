[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / scopeAffectsObservation

# Function: scopeAffectsObservation()

> **scopeAffectsObservation**(`blockerScope`, `observedScope`): `boolean`

Defined in: [store/scope/scope.utils.ts:107](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/scope/scope.utils.ts#L107)

Checks ordinary observation semantics.
A global blocker affects every observed scope and otherwise any shared scope is a match.

## Parameters

### blockerScope

[`Scope`](../type-aliases/Scope.md)

### observedScope

[`Scope`](../type-aliases/Scope.md)

## Returns

`boolean`
