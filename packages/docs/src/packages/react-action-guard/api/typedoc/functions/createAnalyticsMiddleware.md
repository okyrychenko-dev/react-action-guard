[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / createAnalyticsMiddleware

# Function: createAnalyticsMiddleware()

> **createAnalyticsMiddleware**(`config`): [`Middleware`](../type-aliases/Middleware.md)

Defined in: [src/middleware/analyticsMiddleware.ts:112](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/middleware/analyticsMiddleware.ts#L112)

Creates middleware for tracking blocker events to analytics platforms.

Automatically tracks all blocker actions (add, remove, update, timeout, clear)
to your analytics platform. Supports Google Analytics, Mixpanel, Amplitude,
and custom analytics providers.

Event data includes: blockerId, action, scope, reason, priority, timestamp,
and duration (for remove events).

## Parameters

### config

[`AnalyticsConfig`](../type-aliases/AnalyticsConfig.md)

Analytics configuration specifying provider and credentials

## Returns

[`Middleware`](../type-aliases/Middleware.md)

## Examples

Google Analytics integration
```ts
import { configureMiddleware, createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';

const analyticsMiddleware = createAnalyticsMiddleware({
  provider: 'ga',
  trackingId: 'GA-XXXXX-Y'
});

configureMiddleware([analyticsMiddleware]);
```

Mixpanel integration
```ts
const analyticsMiddleware = createAnalyticsMiddleware({
  provider: 'mixpanel',
  token: 'your_mixpanel_token',
  options: {
    debug: true
  }
});

configureMiddleware([analyticsMiddleware]);
```

Custom analytics provider
```ts
const analyticsMiddleware = createAnalyticsMiddleware({
  track: (eventName, eventData) => {
    // Send to your custom analytics
    myAnalytics.track(eventName, {
      ...eventData,
      userId: getCurrentUserId()
    });
  }
});
```

Amplitude with user properties
```ts
const analyticsMiddleware = createAnalyticsMiddleware({
  provider: 'amplitude',
  apiKey: 'your_amplitude_key',
  userId: 'user-123',
  userProperties: {
    plan: 'premium',
    role: 'admin'
  }
});
```

## See

 - [AnalyticsConfig](../type-aliases/AnalyticsConfig.md) for configuration options
 - [configureMiddleware](configureMiddleware.md) for registering middleware

## Since

0.6.0
