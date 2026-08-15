[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / BlockerConfig

# Interface: BlockerConfig

Defined in: [src/store/uiBlockingStore.types.ts:39](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L39)

Configuration options for creating or updating a blocker.

All fields are optional. Defaults will be applied for any missing values:
- `scope`: "global"
- `reason`: "Blocking UI"
- `priority`: 50
- `timestamp`: Current time

## Examples

Basic configuration
```ts
const config: BlockerConfig = {
  scope: 'form',
  reason: 'Submitting data...',
  priority: 70
};
```

With timeout and callback
```ts
const config: BlockerConfig = {
  scope: ['form', 'navigation'],
  reason: 'Critical operation in progress',
  priority: 90,
  timeout: 30000, // 30 seconds
  onTimeout: (id) => {
    console.warn(`Blocker ${id} timed out`);
  }
};
```

## Since

0.6.0

## Extended by

- [`ConfirmableBlockerConfig`](ConfirmableBlockerConfig.md)
- [`ScheduledBlockerConfig`](ScheduledBlockerConfig.md)

## Properties

### scope?

> `optional` **scope**: `string` \| readonly `string`[]

Defined in: [src/store/uiBlockingStore.types.ts:40](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L40)

***

### reason?

> `optional` **reason**: `string`

Defined in: [src/store/uiBlockingStore.types.ts:41](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L41)

***

### priority?

> `optional` **priority**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:43](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L43)

Priority level (negative values are normalized to 0)

***

### timestamp?

> `optional` **timestamp**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:44](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L44)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/store/uiBlockingStore.types.ts:46](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L46)

Automatically remove the blocker after N milliseconds

***

### onTimeout()?

> `optional` **onTimeout**: (`blockerId`) => `void`

Defined in: [src/store/uiBlockingStore.types.ts:48](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/store/uiBlockingStore.types.ts#L48)

Callback invoked when the blocker is automatically removed due to timeout

#### Parameters

##### blockerId

`string`

#### Returns

`void`
