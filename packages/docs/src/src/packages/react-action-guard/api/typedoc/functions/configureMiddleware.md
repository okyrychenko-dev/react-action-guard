[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / configureMiddleware

# Function: configureMiddleware()

> **configureMiddleware**(`middlewares`): `void`

Defined in: [src/middleware/configureMiddleware.ts:64](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/configureMiddleware.ts#L64)

Configures and registers multiple middleware functions for the UI blocking store.

Convenience function that registers an array of middleware at once. Each middleware
is automatically assigned a unique name based on its array index ("middleware-0",
"middleware-1", etc.). Middleware are executed in the order they are registered.

All middleware receive [MiddlewareContext](../interfaces/MiddlewareContext.md) containing action type, blocker ID,
configuration, and timestamp for each blocking event.

## Parameters

### middlewares

readonly [`Middleware`](../type-aliases/Middleware.md)[]

Array of middleware functions to register. Functions are called
                     in order for each blocking action (add, remove, update, etc.)

## Returns

`void`

## Examples

Basic usage with built-in middleware
```ts
import { configureMiddleware, loggerMiddleware, createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';

configureMiddleware([
  loggerMiddleware,
  createPerformanceMiddleware({ threshold: 1000 })
]);
```

With custom middleware
```ts
const customMiddleware: Middleware = (context) => {
  if (context.action === 'add') {
    console.log(`Blocker added: ${context.blockerId}`);
  }
};

configureMiddleware([
  loggerMiddleware,
  customMiddleware
]);
```

Analytics integration
```ts
import { configureMiddleware, createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';

configureMiddleware([
  createAnalyticsMiddleware({
    provider: 'google-analytics',
    trackingId: 'GA-XXXXX'
  })
]);
```

## See

 - [Middleware](../type-aliases/Middleware.md) for middleware function signature
 - [loggerMiddleware](../variables/loggerMiddleware.md) for built-in logging middleware
 - [createAnalyticsMiddleware](createAnalyticsMiddleware.md) for analytics tracking
 - [createPerformanceMiddleware](createPerformanceMiddleware.md) for performance monitoring

## Since

1.0.0
