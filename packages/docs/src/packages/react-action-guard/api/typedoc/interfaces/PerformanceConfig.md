[**React Action Guard API v2.0.0**](../README.md)

***

[React Action Guard API](../README.md) / PerformanceConfig

# Interface: PerformanceConfig

Defined in: [middleware/performanceMiddleware.types.ts:3](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/middleware/performanceMiddleware.types.ts#L3)

## Properties

### slowBlockThreshold?

> `optional` **slowBlockThreshold?**: `number`

Defined in: [middleware/performanceMiddleware.types.ts:4](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/middleware/performanceMiddleware.types.ts#L4)

***

### onSlowBlock?

> `optional` **onSlowBlock?**: (`blockerId`, `duration`) => `void`

Defined in: [middleware/performanceMiddleware.types.ts:5](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/middleware/performanceMiddleware.types.ts#L5)

#### Parameters

##### blockerId

`string`

##### duration

`number`

#### Returns

`void`
