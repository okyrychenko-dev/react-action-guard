[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / UIBlockingStoreActions

# Interface: UIBlockingStoreActions

Defined in: [src/store/uiBlockingStore.types.ts:144](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L144)

All available actions for managing UI blocking state.

These methods allow adding, removing, updating blockers, checking blocking status,
and managing middleware. Combined with UIBlockingStoreState to form
the complete [UIBlockingStore](../type-aliases/UIBlockingStore.md) type.

All actions are safe to call multiple times and handle edge cases gracefully.

## Example

Using store actions directly
```ts
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

// Add a blocker
uiBlockingStoreApi.getState().addBlocker('my-blocker', {
  scope: 'form',
  reason: 'Processing...'
});

// Check if blocked
const isBlocked = uiBlockingStoreApi.getState().isBlocked('form');

// Remove blocker
uiBlockingStoreApi.getState().removeBlocker('my-blocker');
```

## Since

0.6.0

## Properties

### addBlocker()

> **addBlocker**: (`id`, `config?`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:145](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L145)

#### Parameters

##### id

`string`

##### config?

[`BlockerConfig`](BlockerConfig.md)

#### Returns

`void`

***

### updateBlocker()

> **updateBlocker**: (`id`, `config?`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:146](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L146)

#### Parameters

##### id

`string`

##### config?

`Partial`\<[`BlockerConfig`](BlockerConfig.md)\>

#### Returns

`void`

***

### removeBlocker()

> **removeBlocker**: (`id`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:147](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L147)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### isBlocked()

> **isBlocked**: (`scope?`) => `boolean`

Defined in: [src/store/uiBlockingStore.types.ts:148](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L148)

#### Parameters

##### scope?

`string` | readonly `string`[]

#### Returns

`boolean`

***

### getBlockingInfo()

> **getBlockingInfo**: (`scope`) => readonly [`BlockerInfo`](BlockerInfo.md)[]

Defined in: [src/store/uiBlockingStore.types.ts:149](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L149)

#### Parameters

##### scope

`string`

#### Returns

readonly [`BlockerInfo`](BlockerInfo.md)[]

***

### clearAllBlockers

> **clearAllBlockers**: `VoidFunction`

Defined in: [src/store/uiBlockingStore.types.ts:150](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L150)

***

### clearBlockersForScope()

> **clearBlockersForScope**: (`scope`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:151](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L151)

#### Parameters

##### scope

`string`

#### Returns

`void`

***

### registerMiddleware()

> **registerMiddleware**: (`name`, `middleware`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:152](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L152)

#### Parameters

##### name

`string`

##### middleware

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`void`

***

### unregisterMiddleware()

> **unregisterMiddleware**: (`name`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:153](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L153)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### runMiddlewares()

> **runMiddlewares**: (`context`) => `Promise`\<`void`\>

Defined in: [src/store/uiBlockingStore.types.ts:154](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L154)

#### Parameters

##### context

[`MiddlewareContext`](MiddlewareContext.md)

#### Returns

`Promise`\<`void`\>
