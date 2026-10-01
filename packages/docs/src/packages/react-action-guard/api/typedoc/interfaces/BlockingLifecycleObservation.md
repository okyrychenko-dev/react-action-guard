[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / BlockingLifecycleObservation

# Interface: BlockingLifecycleObservation

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:8](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L8)

Read snapshots and observe lifecycle changes without transition authority.

## Extended by

- [`BlockingLifecycle`](BlockingLifecycle.md)

## Properties

### getSnapshot

> **getSnapshot**: () => [`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:9](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L9)

#### Returns

[`BlockingLifecycleSnapshot`](../type-aliases/BlockingLifecycleSnapshot.md)

***

### subscribe

> **subscribe**: (`listener`) => `VoidFunction`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:10](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L10)

#### Parameters

##### listener

(`snapshot`) => `void`

#### Returns

`VoidFunction`

***

### observe

> **observe**: (`observer`) => `VoidFunction`

Defined in: [store/blockingLifecycle/blockingLifecycle.types.ts:11](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts#L11)

#### Parameters

##### observer

[`Middleware`](../type-aliases/Middleware.md)

#### Returns

`VoidFunction`
