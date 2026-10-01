[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / Scope

# Type Alias: Scope

> **Scope** = `string` \| `ReadonlyArray`\<`string`\>

Defined in: [store/scope/scope.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/scope/scope.types.ts#L8)

A blocking scope is either one name or a list of names.

Lists are interpreted as a set: order and duplicate entries have no semantic meaning.
An empty list observes no scope. Guarded controls additionally treat an empty explicit list as
an instruction to inherit their provider scope through [resolveScope](../functions/resolveScope.md).
