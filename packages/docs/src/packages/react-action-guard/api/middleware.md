# Middleware API Reference

Powerful plugin system for extending React Action Guard with analytics, logging, performance monitoring, and custom functionality.

## Overview

Middleware functions are called whenever blocker state changes, allowing you to:

- **Track analytics** (Google Analytics, Mixpanel, Amplitude)
- **Log events** for debugging
- **Monitor performance** and detect slow operations
- **Integrate with external systems**
- **Implement custom business logic**

## Middleware Function

```typescript
type Middleware = (context: MiddlewareContext) => void;

interface MiddlewareContext {
  action: BlockingAction;
  blockerId: string;
  config?: BlockerConfig;
  timestamp: number;
  prevState?: BlockerConfig;  // For 'update' and 'remove'
  scope?: string;             // For 'clear_scope'
  count?: number;             // For 'clear' and 'clear_scope'
}

type BlockingAction = 'add' | 'update' | 'remove' | 'timeout' | 'clear' | 'clear_scope';
```

## Middleware Actions

| Action | When Triggered | Context Fields |
|--------|----------------|----------------|
| `add` | Blocker added | `blockerId`, `config`, `timestamp` |
| `update` | Blocker updated | `blockerId`, `config`, `prevState`, `timestamp` |
| `remove` | Blocker manually removed | `blockerId`, `prevState`, `timestamp` |
| `timeout` | Blocker auto-removed (timeout) | `blockerId`, `prevState`, `timestamp` |
| `clear` | All blockers cleared | `timestamp`, `count` |
| `clear_scope` | Scope blockers cleared | `scope`, `timestamp`, `count` |

## Registration

### configureMiddleware

Register middleware on the global store.

```typescript
function configureMiddleware(middlewares: Middleware[]): void
```

**Example:**

```typescript
import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

// Register multiple middleware
configureMiddleware([
  loggerMiddleware,
  customAnalyticsMiddleware,
  performanceMiddleware,
]);
```

### With Provider

Register middleware via Provider props:

```typescript
import { UIBlockingProvider, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

function App() {
  return (
    <UIBlockingProvider
      middlewares={[
        loggerMiddleware,
        customMiddleware,
      ]}
    >
      <YourApp />
    </UIBlockingProvider>
  );
}
```

### Manual Registration

Use store methods for dynamic registration:

```typescript
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

const store = uiBlockingStoreApi.getState();

// Register
store.registerMiddleware('my-middleware', myMiddleware);

// Unregister
store.unregisterMiddleware('my-middleware');
```

## Built-in Middleware

### Logger Middleware

Logs all blocker events to console.

```typescript
import { loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

configureMiddleware([loggerMiddleware]);
```

**Output:**

```
[Blocker] add: save-operation
  Config: { scope: 'form', reason: 'Saving...', priority: 10 }
  Timestamp: Thu Jan 15 2024 14:30:00

[Blocker] remove: save-operation
  Previous: { scope: 'form', reason: 'Saving...', priority: 10 }
  Timestamp: Thu Jan 15 2024 14:30:05
```

**Source Code:**

```typescript
export const loggerMiddleware: Middleware = (context) => {
  const { action, blockerId, config, prevState, scope, count } = context;
  
  console.groupCollapsed(`[Blocker] ${action}: ${blockerId || 'N/A'}`);
  
  if (config) {
    console.log('Config:', config);
  }
  
  if (prevState) {
    console.log('Previous:', prevState);
  }
  
  if (scope) {
    console.log('Scope:', scope);
  }
  
  if (count !== undefined) {
    console.log('Count:', count);
  }
  
  console.log('Timestamp:', new Date(context.timestamp));
  console.groupEnd();
};
```

---

### Analytics Middleware

Track blocker events with analytics providers.

```typescript
import { createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';

// Google Analytics
const gaMiddleware = createAnalyticsMiddleware({
  provider: 'ga',
});

// Mixpanel
const mixpanelMiddleware = createAnalyticsMiddleware({
  provider: 'mixpanel',
});

// Amplitude
const amplitudeMiddleware = createAnalyticsMiddleware({
  provider: 'amplitude',
});

// Custom tracker
const customMiddleware = createAnalyticsMiddleware({
  track: (eventName, data) => {
    myAnalytics.track(eventName, data);
  },
});

configureMiddleware([gaMiddleware]);
```

**Tracked Events:**

| Event Name | Data |
|------------|------|
| `blocker_add` | `{ blocker_id, scope, priority, reason }` |
| `blocker_update` | `{ blocker_id, scope, priority, reason }` |
| `blocker_remove` | `{ blocker_id, scope, priority, reason, duration_ms }` |
| `blocker_timeout` | `{ blocker_id, scope, priority, reason, duration_ms }` |
| `blockers_clear` | `{ count }` |
| `blockers_clear_scope` | `{ scope, count }` |

**Configuration:**

```typescript
interface AnalyticsConfig {
  // Predefined provider
  provider?: 'ga' | 'mixpanel' | 'amplitude';
  
  // Or custom tracker
  track?: (eventName: string, data: AnalyticsEventData) => void;
  
  // Optional: filter events
  shouldTrack?: (context: MiddlewareContext) => boolean;
}
```

**Examples:**

```typescript
// With filter
const analyticsMiddleware = createAnalyticsMiddleware({
  provider: 'ga',
  shouldTrack: (context) => {
    // Only track high-priority blockers
    return context.config?.priority && context.config.priority >= 50;
  },
});

// Custom implementation
const customMiddleware = createAnalyticsMiddleware({
  track: (eventName, data) => {
    // Send to your backend
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: eventName, ...data }),
    });
  },
});
```

---

### Performance Middleware

Monitor blocker performance and detect slow operations.

```typescript
import { createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';

const perfMiddleware = createPerformanceMiddleware({
  slowBlockThreshold: 5000, // 5 seconds
  onSlowBlock: (blockerId, duration) => {
    console.warn(`Slow blocker detected: ${blockerId} was active for ${duration}ms`);
    
    // Send to error tracking
    Sentry.captureMessage(`Slow blocker: ${blockerId}`, {
      level: 'warning',
      extra: { duration },
    });
  },
});

configureMiddleware([perfMiddleware]);
```

**Configuration:**

```typescript
interface PerformanceConfig {
  slowBlockThreshold?: number;  // Threshold in ms (default: 3000)
  onSlowBlock?: (blockerId: string, duration: number) => void;
  
  // Optional: additional hooks
  onBlockerAdd?: (blockerId: string, timestamp: number) => void;
  onBlockerRemove?: (blockerId: string, duration: number) => void;
}
```

**Full Example:**

```typescript
const perfMiddleware = createPerformanceMiddleware({
  slowBlockThreshold: 3000,
  
  onSlowBlock: (blockerId, duration) => {
    console.warn(`⚠️ Slow blocker: ${blockerId} (${duration}ms)`);
    
    // Track in analytics
    analytics.track('slow_blocker', {
      blocker_id: blockerId,
      duration_ms: duration,
    });
  },
  
  onBlockerAdd: (blockerId, timestamp) => {
    performance.mark(`blocker-start-${blockerId}`);
  },
  
  onBlockerRemove: (blockerId, duration) => {
    performance.mark(`blocker-end-${blockerId}`);
    performance.measure(
      `blocker-${blockerId}`,
      `blocker-start-${blockerId}`,
      `blocker-end-${blockerId}`
    );
  },
});
```

## Custom Middleware

### Basic Template

```typescript
const myMiddleware: Middleware = (context) => {
  const { action, blockerId, config } = context;
  
  switch (action) {
    case 'add':
      // Blocker added
      break;
      
    case 'update':
      // Blocker updated
      // context.prevState available
      break;
      
    case 'remove':
      // Blocker manually removed
      // context.prevState available
      break;
      
    case 'timeout':
      // Blocker auto-removed
      // context.prevState available
      break;
      
    case 'clear':
      // All blockers cleared
      // context.count available
      break;
      
    case 'clear_scope':
      // Scope blockers cleared
      // context.scope and context.count available
      break;
  }
};

configureMiddleware([myMiddleware]);
```

### Audit Logging

```typescript
const auditMiddleware: Middleware = (context) => {
  const { action, blockerId, config, timestamp } = context;
  
  const logEntry = {
    timestamp: new Date(timestamp).toISOString(),
    action,
    blocker_id: blockerId,
    scope: config?.scope,
    priority: config?.priority,
    reason: config?.reason,
    user: getCurrentUser(),
    session: getSessionId(),
  };
  
  // Send to audit log
  fetch('/api/audit-log', {
    method: 'POST',
    body: JSON.stringify(logEntry),
  });
};
```

### State Persistence

```typescript
const persistenceMiddleware: Middleware = (context) => {
  // Save to localStorage on any change
  const state = uiBlockingStoreApi.getState();
  const blockers = Array.from(state.blockers.values());
  
  localStorage.setItem('blockers', JSON.stringify(blockers));
};

// Restore on init
function restoreBlockers() {
  const saved = localStorage.getItem('blockers');
  if (saved) {
    const blockers = JSON.parse(saved);
    const store = uiBlockingStoreApi.getState();
    
    blockers.forEach((blocker: any) => {
      store.addBlocker(blocker.id, {
        scope: blocker.scope,
        reason: blocker.reason,
        priority: blocker.priority,
      });
    });
  }
}
```

### Notification System

```typescript
const notificationMiddleware: Middleware = (context) => {
  const { action, blockerId, config } = context;
  
  if (action === 'add' && config?.priority && config.priority >= 80) {
    // Show notification for high-priority blockers
    showNotification({
      title: 'Operation in Progress',
      message: config.reason || 'Please wait...',
      type: 'info',
    });
  }
  
  if (action === 'timeout') {
    // Alert on timeout
    showNotification({
      title: 'Operation Timed Out',
      message: `${blockerId} timed out`,
      type: 'error',
    });
  }
};
```

### Conditional Middleware

```typescript
// Only run in development
const devOnlyMiddleware: Middleware = (context) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('Dev only:', context);
};

// Only for specific scopes
const scopeFilteredMiddleware: Middleware = (context) => {
  if (context.config?.scope === 'debug' || context.scope === 'debug') {
    console.log('Debug scope event:', context);
  }
};

// Only for high priority
const highPriorityMiddleware: Middleware = (context) => {
  if (context.config?.priority && context.config.priority >= 90) {
    alertOncall(`High priority blocker: ${context.blockerId}`);
  }
};
```

### Error Boundary

```typescript
const errorHandlingMiddleware: Middleware = (context) => {
  try {
    // Your middleware logic
    performAction(context);
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Report to error tracking
    Sentry.captureException(error, {
      tags: {
        middleware: 'custom',
        action: context.action,
        blocker_id: context.blockerId,
      },
    });
    
    // Continue gracefully
  }
};
```

## Advanced Patterns

### Combining Middleware

```typescript
// Create factory for composing middleware
function composeMiddleware(...middlewares: Middleware[]): Middleware {
  return (context) => {
    middlewares.forEach(middleware => {
      try {
        middleware(context);
      } catch (error) {
        console.error('Middleware error:', error);
      }
    });
  };
}

// Use
const combined = composeMiddleware(
  loggerMiddleware,
  analyticsMiddleware,
  customMiddleware
);

configureMiddleware([combined]);
```

### Conditional Registration

```typescript
function getMiddlewares(): Middleware[] {
  const middlewares: Middleware[] = [];
  
  // Always add logger in dev
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware);
  }
  
  // Add analytics in production
  if (process.env.NODE_ENV === 'production') {
    middlewares.push(createAnalyticsMiddleware({ provider: 'ga' }));
  }
  
  // Add performance monitoring if enabled
  if (config.enablePerformanceMonitoring) {
    middlewares.push(createPerformanceMiddleware({
      slowBlockThreshold: 5000,
    }));
  }
  
  return middlewares;
}

configureMiddleware(getMiddlewares());
```

### Middleware with State

```typescript
// Create middleware factory with closured state
function createRateLimitMiddleware(maxEventsPerSecond: number): Middleware {
  let eventCount = 0;
  let lastReset = Date.now();
  
  return (context) => {
    const now = Date.now();
    
    // Reset counter every second
    if (now - lastReset > 1000) {
      eventCount = 0;
      lastReset = now;
    }
    
    eventCount++;
    
    if (eventCount > maxEventsPerSecond) {
      console.warn('Rate limit exceeded, dropping event');
      return;
    }
    
    // Process event
    processEvent(context);
  };
}

const rateLimitedMiddleware = createRateLimitMiddleware(100);
```

## Best Practices

### 1. Keep Middleware Fast

```typescript
// ❌ Bad: Slow synchronous operation
const slowMiddleware: Middleware = (context) => {
  // This blocks the UI!
  const result = heavyComputation();
  sendToServer(result);
};

// ✅ Good: Async operations don't block
const fastMiddleware: Middleware = (context) => {
  // Fire and forget
  Promise.resolve().then(async () => {
    const result = await heavyComputation();
    await sendToServer(result);
  });
};
```

### 2. Handle Errors

```typescript
// ❌ Bad: Unhandled errors break other middleware
const unsafeMiddleware: Middleware = (context) => {
  riskyOperation(); // Might throw
};

// ✅ Good: Errors are caught
const safeMiddleware: Middleware = (context) => {
  try {
    riskyOperation();
  } catch (error) {
    console.error('Middleware error:', error);
  }
};
```

### 3. Avoid Side Effects

```typescript
// ❌ Bad: Modifying context
const mutatingMiddleware: Middleware = (context) => {
  context.config.priority = 999; // Don't do this!
};

// ✅ Good: Read-only access
const readonlyMiddleware: Middleware = (context) => {
  const priority = context.config?.priority || 0;
  logPriority(priority);
};
```

### 4. Conditional Logic

```typescript
// ✅ Good: Early returns
const conditionalMiddleware: Middleware = (context) => {
  // Skip if not interested
  if (context.action !== 'add') {
    return;
  }
  
  if (!context.config?.scope) {
    return;
  }
  
  // Process
  trackEvent(context);
};
```

## Performance Considerations

- Middleware runs **synchronously** on every store mutation
- Keep middleware functions **fast** (< 1ms)
- Use async operations for network calls
- Avoid heavy computation in middleware
- Consider batching/throttling for high-frequency events

## Related

- [Store API](./store) - Register/unregister middleware
- [Architecture](../architecture#middleware-system) - Middleware implementation details
- [Guides: Middleware System](../guides/middleware-system) - Usage patterns
