[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / createPerformanceMiddleware

# Function: createPerformanceMiddleware()

> **createPerformanceMiddleware**(`config`): [`Middleware`](../type-aliases/Middleware.md)

Defined in: [src/middleware/performanceMiddleware.ts:122](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/performanceMiddleware.ts#L122)

Creates middleware for monitoring blocker performance and detecting slow blocks.

Tracks the duration of each blocker (from add to remove) and warns when a blocker
exceeds the configured threshold. Useful for identifying performance issues,
stuck blockers, or operations that take too long.

Automatically logs warnings to console for slow blocks and optionally invokes
a callback for custom handling (e.g., error reporting, analytics).

## Parameters

### config

[`PerformanceConfig`](../interfaces/PerformanceConfig.md) = `{}`

Performance monitoring configuration

## Returns

[`Middleware`](../type-aliases/Middleware.md)

Middleware function for performance monitoring

## Examples

Basic usage with default threshold
```ts
import { configureMiddleware, createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';

const performanceMiddleware = createPerformanceMiddleware();

configureMiddleware([performanceMiddleware]);
// Warns if any blocker lasts > 3 seconds
```

Custom threshold and callback
```ts
const performanceMiddleware = createPerformanceMiddleware({
  slowBlockThreshold: 5000, // 5 seconds
  onSlowBlock: (blockerId, duration) => {
    console.error(`Blocker ${blockerId} took ${duration}ms`);
    
    // Report to error tracking
    Sentry.captureMessage('Slow UI Blocker', {
      extra: { blockerId, duration }
    });
  }
});
```

With analytics integration
```ts
const performanceMiddleware = createPerformanceMiddleware({
  slowBlockThreshold: 2000,
  onSlowBlock: (blockerId, duration) => {
    // Track slow blocks in analytics
    analytics.track('slow_blocker_detected', {
      blocker_id: blockerId,
      duration_ms: duration,
      threshold_ms: 2000
    });
  }
});
```

Development vs Production
```ts
const performanceMiddleware = createPerformanceMiddleware({
  // Strict threshold in development
  slowBlockThreshold: process.env.NODE_ENV === 'production' ? 5000 : 1000,
  onSlowBlock: (blockerId, duration) => {
    if (process.env.NODE_ENV === 'production') {
      // Report to error service in production
      errorService.log({ blockerId, duration });
    } else {
      // Detailed logging in development
      console.table({ blockerId, duration });
    }
  }
});
```

## See

 - [PerformanceConfig](../interfaces/PerformanceConfig.md) for configuration options
 - [configureMiddleware](configureMiddleware.md) for registering middleware

## Since

0.6.0
