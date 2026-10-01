[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / UseAsyncActionOptions

# Interface: UseAsyncActionOptions

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L9)

Options for useAsyncAction hook

## Properties

### timeout?

> `optional` **timeout?**: `number`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L11)

Timeout in milliseconds after which the blocker will be automatically removed

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [hooks/useAsyncAction/useAsyncAction.ts:13](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useAsyncAction/useAsyncAction.ts#L13)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
