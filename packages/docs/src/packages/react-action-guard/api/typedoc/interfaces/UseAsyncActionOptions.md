[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / UseAsyncActionOptions

# Interface: UseAsyncActionOptions

Defined in: [src/hooks/useAsyncAction/useAsyncAction.ts:8](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useAsyncAction/useAsyncAction.ts#L8)

Options for useAsyncAction hook

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/hooks/useAsyncAction/useAsyncAction.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useAsyncAction/useAsyncAction.ts#L10)

Timeout in milliseconds after which the blocker will be automatically removed

***

### onTimeout()?

> `optional` **onTimeout**: (`blockerId`) => `void`

Defined in: [src/hooks/useAsyncAction/useAsyncAction.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useAsyncAction/useAsyncAction.ts#L12)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
