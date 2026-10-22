[**React Action Guard API v2.1.0**](../README.md)

***

[React Action Guard API](../README.md) / createPerformanceMiddleware

# Function: createPerformanceMiddleware()

> **createPerformanceMiddleware**(`config?`): [`Middleware`](../type-aliases/Middleware.md)

Defined in: [middleware/performanceMiddleware.ts:15](https://github.com/okyrychenko-dev/react-action-guard/blob/main/packages/core/src/middleware/performanceMiddleware.ts#L15)

Measures registration lifetimes from add until removal, timeout or bulk clear.
Updates preserve the start; replacement adds restart it. Callback failures are isolated.

## Parameters

### config?

[`PerformanceConfig`](../interfaces/PerformanceConfig.md) = `{}`

## Returns

[`Middleware`](../type-aliases/Middleware.md)

## Since

0.6.0
