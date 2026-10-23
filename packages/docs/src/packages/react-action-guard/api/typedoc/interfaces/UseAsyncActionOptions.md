[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / UseAsyncActionOptions

# Interface: UseAsyncActionOptions

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L10)

Options for useAsyncAction hook

## Properties

### reason?

> `optional` **reason?**: `string`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L12)

Human-readable reason; defaults to `Executing ${actionId}`

***

### priority?

> `optional` **priority?**: `number`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L14)

Reason ordering priority (minimum 0); defaults to ASYNC_ACTION_PRIORITY (20)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L16)

Blocker lifetime in milliseconds; does not cancel or settle the operation

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L18)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
