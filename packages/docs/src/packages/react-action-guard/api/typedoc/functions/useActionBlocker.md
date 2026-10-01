[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useActionBlocker

# Function: useActionBlocker()

> **useActionBlocker**(`blockerId`, `config`, `isActive?`): `void`

Defined in: [hooks/useActionBlocker/useActionBlocker.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useActionBlocker/useActionBlocker.ts#L17)

Automatically manages a UI blocker based on component lifecycle.

## Parameters

### blockerId

`string`

### config

[`BlockerConfig`](../interfaces/BlockerConfig.md)

### isActive?

`boolean` = `true`

## Returns

`void`

## Since

0.6.0

## See

 - [useIsBlocked](useIsBlocked.md) to check if a scope is currently blocked
 - [useBlockingInfo](useBlockingInfo.md) to get detailed blocker information
 - [useAsyncAction](useAsyncAction.md) for async operation wrapping with automatic blocking
 - [useConfirmableBlocker](useConfirmableBlocker.md) for blockers that require user confirmation
