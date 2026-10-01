[**React Action Guard API v1.0.5**](../README.md)

***

[React Action Guard API](../README.md) / createPerformanceMiddleware

# Function: createPerformanceMiddleware()

> **createPerformanceMiddleware**(`config?`): [`Middleware`](../type-aliases/Middleware.md)

Defined in: [middleware/performanceMiddleware.ts:43](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/middleware/performanceMiddleware.ts#L43)

Creates middleware for monitoring blocker performance and detecting slow blocks.

## Parameters

### config?

[`PerformanceConfig`](../interfaces/PerformanceConfig.md) = `{}`

## Returns

[`Middleware`](../type-aliases/Middleware.md)

## Since

0.6.0

## See

 - [PerformanceConfig](../interfaces/PerformanceConfig.md) for configuration options
 - [configureMiddleware](configureMiddleware.md) for registering middleware
