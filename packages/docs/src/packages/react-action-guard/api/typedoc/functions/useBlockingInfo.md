[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useBlockingInfo

# Function: useBlockingInfo()

> **useBlockingInfo**(`scope?`): readonly `Readonly`\<[`BlockerInfo`](../interfaces/BlockerInfo.md)\>[]

Defined in: [hooks/useBlockingInfo/useBlockingInfo.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useBlockingInfo/useBlockingInfo.ts#L16)

Gets detailed information about all active blockers for a specific scope.

## Parameters

### scope?

`string` = `DEFAULT_SCOPE`

## Returns

readonly `Readonly`\<[`BlockerInfo`](../interfaces/BlockerInfo.md)\>[]

## Since

0.6.0

## See

 - [useIsBlocked](useIsBlocked.md) for a simple boolean check
 - [useActionBlocker](useActionBlocker.md) to create blockers
 - [BlockerInfo](../interfaces/BlockerInfo.md) for the structure of blocker information objects
