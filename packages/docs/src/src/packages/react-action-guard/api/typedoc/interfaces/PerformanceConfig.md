[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / PerformanceConfig

# Interface: PerformanceConfig

Defined in: [src/middleware/performanceMiddleware.types.ts:1](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/performanceMiddleware.types.ts#L1)

## Properties

### slowBlockThreshold?

> `optional` **slowBlockThreshold**: `number`

Defined in: [src/middleware/performanceMiddleware.types.ts:2](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/performanceMiddleware.types.ts#L2)

***

### onSlowBlock()?

> `optional` **onSlowBlock**: (`blockerId`, `duration`) => `void`

Defined in: [src/middleware/performanceMiddleware.types.ts:3](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/performanceMiddleware.types.ts#L3)

#### Parameters

##### blockerId

`string`

##### duration

`number`

#### Returns

`void`
