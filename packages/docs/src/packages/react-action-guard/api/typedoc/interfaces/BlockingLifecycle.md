[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / BlockingLifecycle

# Interface: BlockingLifecycle

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:14](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L14)

Read snapshots and observe lifecycle changes without transition authority.

## Extends

- [`BlockingLifecycleObservation`](BlockingLifecycleObservation.md)

## Properties

### getSnapshot

> **getSnapshot**: () => [`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L9)

#### Returns

[`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)

#### Inherited from

[`BlockingLifecycleObservation`](BlockingLifecycleObservation.md).[`getSnapshot`](BlockingLifecycleObservation.md#getsnapshot)

***

### subscribe

> **subscribe**: (`listener`) => `VoidFunction`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L10)

#### Parameters

##### listener

(`snapshot`) => `void`

#### Returns

`VoidFunction`

#### Inherited from

[`BlockingLifecycleObservation`](BlockingLifecycleObservation.md).[`subscribe`](BlockingLifecycleObservation.md#subscribe)

***

### observe

> **observe**: (`observer`) => `VoidFunction`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L11)

#### Parameters

##### observer

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`VoidFunction`

#### Inherited from

[`BlockingLifecycleObservation`](BlockingLifecycleObservation.md).[`observe`](BlockingLifecycleObservation.md#observe)

***

### add

> **add**: (`id`, `config?`) => `void`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L15)

#### Parameters

##### id

`string`

##### config?

[`BlockerConfig`](BlockerConfig.md)

#### Returns

`void`

***

### update

> **update**: (`id`, `config?`) => `void`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:16](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L16)

#### Parameters

##### id

`string`

##### config?

`Partial`\<[`BlockerConfig`](BlockerConfig.md)\>

#### Returns

`void`

***

### remove

> **remove**: (`id`) => `void`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:17](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L17)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### clear

> **clear**: () => `void`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:18](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L18)

#### Returns

`void`

***

### clearScope

> **clearScope**: (`scope`) => `void`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:19](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L19)

#### Parameters

##### scope

`string`

#### Returns

`void`

***

### isBlocked

> **isBlocked**: (`scope?`) => `boolean`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:20](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L20)

#### Parameters

##### scope?

`string` \| readonly `string`[]

#### Returns

`boolean`

***

### getBlockingInfo

> **getBlockingInfo**: (`scope`) => [`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:21](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L21)

#### Parameters

##### scope

`string`

#### Returns

[`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)
