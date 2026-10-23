[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / ConfirmableBlockerConfig

# Interface: ConfirmableBlockerConfig

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L19)

Configuration for confirmable blocker hook.

The reason property can be used to provide a different blocking reason
than the confirmMessage. If not provided, confirmMessage will be used as the reason.

## Extends

- [`BlockerConfig`](BlockerConfig.md)

## Properties

### confirmMessage

> **confirmMessage**: `string`

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L21)

Message to display in the confirmation dialog

***

### confirmTitle?

> `optional` **confirmTitle?**: `string`

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:23](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L23)

Title for the confirmation dialog (default: "Confirm Action")

***

### confirmButtonText?

> `optional` **confirmButtonText?**: `string`

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:25](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L25)

Text for the confirm button (default: "Confirm")

***

### cancelButtonText?

> `optional` **cancelButtonText?**: `string`

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:27](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L27)

Text for the cancel button (default: "Cancel")

***

### onConfirm

> **onConfirm**: () => `void` \| `Promise`\<`void`\>

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:29](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L29)

Callback to execute when confirmed. Can be async.

#### Returns

`void` \| `Promise`\<`void`\>

***

### onCancel?

> `optional` **onCancel?**: `VoidFunction`

Defined in: [hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts:31](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/hooks/useConfirmableBlocker/useConfirmableBlocker.types.ts#L31)

Optional callback to execute when cancelled

***

### scope?

> `optional` **scope?**: `string` \| readonly `string`[]

Defined in: [store/uiBlockingStore.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L11)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`scope`](BlockerConfig.md#scope)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [store/uiBlockingStore.types.ts:12](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L12)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`reason`](BlockerConfig.md#reason)

***

### priority?

> `optional` **priority?**: `number`

Defined in: [store/uiBlockingStore.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L14)

Priority level (negative values are normalized to 0)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`priority`](BlockerConfig.md#priority)

***

### timestamp?

> `optional` **timestamp?**: `number`

Defined in: [store/uiBlockingStore.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L15)

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timestamp`](BlockerConfig.md#timestamp)

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [store/uiBlockingStore.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L21)

Remove after a positive finite delay in milliseconds, using bounded timer chunks.
Omitted, zero and finite negative values disable expiration. Invalid/nonfinite values
or a deadline beyond Number.MAX_SAFE_INTEGER throw RangeError before mutation.

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`timeout`](BlockerConfig.md#timeout)

***

### onTimeout?

> `optional` **onTimeout?**: (`blockerId`) => `void`

Defined in: [store/uiBlockingStore.types.ts:23](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/uiBlockingStore.types.ts#L23)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`

#### Inherited from

[`BlockerConfig`](BlockerConfig.md).[`onTimeout`](BlockerConfig.md#ontimeout)
