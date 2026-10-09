[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / useAsyncAction

# Function: useAsyncAction()

> **useAsyncAction**\<`T`\>(`actionId`, `scope?`, `options?`): (`asyncFn`) => `Promise`\<`T`\>

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:27](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L27)

Wraps async functions with UI blocking. Concurrent calls get unique blocker IDs;
each blocker is removed in finally on success or failure, even after caller unmount.
Tracking does not exclude concurrent execution. Timeout releases only the blocker.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### actionId

`string`

### scope?

`string` \| readonly `string`[]

### options?

[`UseAsyncActionOptions`](../interfaces/UseAsyncActionOptions.md)

## Returns

(`asyncFn`) => `Promise`\<`T`\>

## Since

0.6.0

## See

 - [useActionBlocker](useActionBlocker.md) for manual blocker management
 - [useIsBlocked](useIsBlocked.md) to check blocking state
 - [UseAsyncActionOptions](../interfaces/UseAsyncActionOptions.md) for available options
