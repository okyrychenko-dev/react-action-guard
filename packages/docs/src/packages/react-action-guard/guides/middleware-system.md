# Middleware System Guide

Learn how to extend React Action Guard with custom middleware for analytics, logging, and business logic.

## What is Middleware?

Middleware functions are called automatically whenever blocker state changes. They enable you to:

- **Track user behavior** with analytics (GA, Mixpanel, Amplitude)
- **Debug issues** with detailed logging
- **Monitor performance** and detect slow operations
- **Integrate with external systems** (audit logs, notifications)
- **Implement custom business logic** (compliance, rate limiting)

## Quick Start

```typescript
import { configureMiddleware, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

// Enable logging in development
if (process.env.NODE_ENV === 'development') {
  configureMiddleware([loggerMiddleware]);
}
```

## Middleware Lifecycle

Every middleware function receives a context object describing what changed:

```typescript
interface MiddlewareContext {
  action: 'add' | 'update' | 'remove' | 'timeout' | 'clear' | 'clear_scope';
  blockerId: string;
  config?: BlockerConfig;
  timestamp: number;
  prevState?: BlockerConfig;  // For update/remove
  scope?: string;             // For clear_scope
  count?: number;             // For clear/clear_scope
}
```

**Actions:**

- **add**: New blocker was added
- **update**: Existing blocker metadata changed
- **remove**: Blocker was manually removed
- **timeout**: Blocker auto-removed due to timeout
- **clear**: All blockers were cleared
- **clear_scope**: All blockers for a scope were cleared

## Built-In Middleware

### Logger Middleware

Perfect for development debugging:

```typescript
import { loggerMiddleware } from '@okyrychenko-dev/react-action-guard';

configureMiddleware([loggerMiddleware]);
```

Output example:
```
[Blocker] add: save-operation
  Config: { scope: 'form', reason: 'Saving...', priority: 10 }
  Timestamp: Thu Jan 15 2024 14:30:00
```

### Analytics Middleware

Track blocker events in your analytics platform:

```typescript
import { createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';

// Google Analytics
const middleware = createAnalyticsMiddleware({
  provider: 'ga',
});

configureMiddleware([middleware]);
```

**Supported Providers:**
- Google Analytics (`'ga'`)
- Mixpanel (`'mixpanel'`)
- Amplitude (`'amplitude'`)
- Custom (provide your own `track` function)

**Events Tracked:**
- `blocker_add` - When blocker is added
- `blocker_remove` - When manually removed
- `blocker_timeout` - When auto-removed
- `blockers_clear` - When all cleared

### Performance Middleware

Detect and alert on slow operations:

```typescript
import { createPerformanceMiddleware } from '@okyrychenko-dev/react-action-guard';

const middleware = createPerformanceMiddleware({
  slowBlockThreshold: 5000, // 5 seconds
  onSlowBlock: (blockerId, duration) => {
    console.warn(`Slow operation: ${blockerId} took ${duration}ms`);
    
    // Send to error tracking
    Sentry.captureMessage(`Slow blocker: ${blockerId}`, {
      level: 'warning',
      extra: { duration },
    });
  },
});

configureMiddleware([middleware]);
```

## Custom Middleware

### Basic Template

```typescript
import type { Middleware } from '@okyrychenko-dev/react-action-guard';

const myMiddleware: Middleware = (context) => {
  const { action, blockerId, config } = context;
  
  // Handle different actions
  switch (action) {
    case 'add':
      console.log(`Blocker added: ${blockerId}`);
      break;
      
    case 'timeout':
      console.warn(`Blocker timed out: ${blockerId}`);
      break;
  }
};

configureMiddleware([myMiddleware]);
```

### Real-World Examples

#### 1. Audit Logging

Track all blocking events for compliance:

```typescript
const auditMiddleware: Middleware = (context) => {
  const { action, blockerId, config, timestamp } = context;
  
  const auditEntry = {
    timestamp: new Date(timestamp).toISOString(),
    action,
    blocker_id: blockerId,
    scope: config?.scope,
    user: getCurrentUser(),
    session: getSessionId(),
  };
  
  // Send to audit log
  fetch('/api/audit-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auditEntry),
  }).catch(err => {
    console.error('Failed to log audit:', err);
  });
};
```

#### 2. User Notifications

Show notifications for important blockers:

```typescript
const notificationMiddleware: Middleware = (context) => {
  const { action, config } = context;
  
  // Show notification for high-priority blockers
  if (action === 'add' && config?.priority && config.priority >= 80) {
    showToast({
      title: 'Operation in Progress',
      message: config.reason || 'Please wait...',
      type: 'info',
      duration: null, // Don't auto-hide
    });
  }
  
  // Show error on timeout
  if (action === 'timeout') {
    showToast({
      title: 'Operation Timed Out',
      message: 'The operation took too long and was cancelled',
      type: 'error',
    });
  }
};
```

#### 3. State Persistence

Save blocker state to localStorage:

```typescript
const persistenceMiddleware: Middleware = () => {
  // Debounce to avoid too frequent saves
  debounce(() => {
    const state = uiBlockingStoreApi.getState();
    const blockers = Array.from(state.blockers.values());
    
    localStorage.setItem('ui-blockers', JSON.stringify(blockers));
  }, 500)();
};

// Restore on app init
function restoreBlockers() {
  const saved = localStorage.getItem('ui-blockers');
  if (!saved) {
    return;
  }
  
  try {
    const blockers = JSON.parse(saved);
    const store = uiBlockingStoreApi.getState();
    
    blockers.forEach((blocker: any) => {
      store.addBlocker(blocker.id, {
        scope: blocker.scope,
        reason: blocker.reason,
        priority: blocker.priority,
      });
    });
  } catch (err) {
    console.error('Failed to restore blockers:', err);
  }
}
```

#### 4. Analytics with Filtering

Only track specific events:

```typescript
const filteredAnalyticsMiddleware = createAnalyticsMiddleware({
  provider: 'ga',
  shouldTrack: (context) => {
    // Only track production
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }
    
    // Only track high-priority blockers
    if (context.config?.priority && context.config.priority < 50) {
      return false;
    }
    
    // Don't track certain scopes
    const scope = context.config?.scope;
    if (scope === 'debug' || scope === 'internal') {
      return false;
    }
    
    return true;
  },
});
```

#### 5. Rate Limiting

Prevent excessive middleware execution:

```typescript
function createRateLimited Middleware(maxPerSecond: number): Middleware {
  let count = 0;
  let lastReset = Date.now();
  
  return (context) => {
    const now = Date.now();
    
    // Reset every second
    if (now - lastReset >= 1000) {
      count = 0;
      lastReset = now;
    }
    
    count++;
    
    if (count > maxPerSecond) {
      console.warn('Middleware rate limit exceeded');
      return; // Skip this event
    }
    
    // Process event
    processEvent(context);
  };
}

const rateLimited = createRateLimitedMiddleware(100); // Max 100 events/sec
```

## Registration Methods

### 1. Global Configuration

Register middleware for the global store:

```typescript
import { configureMiddleware } from '@okyrychenko-dev/react-action-guard';

configureMiddleware([
  loggerMiddleware,
  analyticsMiddleware,
  customMiddleware,
]);
```

### 2. With Provider

Register middleware via Provider props:

```typescript
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

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

### 3. Dynamic Registration

Add/remove middleware at runtime:

```typescript
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

const store = uiBlockingStoreApi.getState();

// Register
store.registerMiddleware('my-middleware', myMiddleware);

// Unregister
store.unregisterMiddleware('my-middleware');
```

### 4. Conditional Registration

Register based on environment:

```typescript
function getMiddlewares(): Middleware[] {
  const middlewares: Middleware[] = [];
  
  // Always add logger in development
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware);
  }
  
  // Add analytics in production
  if (process.env.NODE_ENV === 'production') {
    middlewares.push(createAnalyticsMiddleware({ provider: 'ga' }));
  }
  
  // Feature flag
  if (featureFlags.enablePerformanceMonitoring) {
    middlewares.push(createPerformanceMiddleware({
      slowBlockThreshold: 5000,
    }));
  }
  
  return middlewares;
}

configureMiddleware(getMiddlewares());
```

## Best Practices

### 1. Keep Middleware Fast ⚡

Middleware runs synchronously on every state change. Keep it fast!

```typescript
// ❌ Bad: Slow synchronous work
const slowMiddleware: Middleware = (context) => {
  const result = heavyComputation(); // Blocks UI!
  sendToServer(result);
};

// ✅ Good: Async work doesn't block
const fastMiddleware: Middleware = (context) => {
  // Fire and forget
  Promise.resolve().then(async () => {
    const result = await heavyComputation();
    await sendToServer(result);
  });
};
```

### 2. Handle Errors Gracefully 🛡️

```typescript
// ❌ Bad: Unhandled errors break other middleware
const unsafeMiddleware: Middleware = (context) => {
  riskyOperation(); // Might throw!
};

// ✅ Good: Errors are caught
const safeMiddleware: Middleware = (context) => {
  try {
    riskyOperation();
  } catch (error) {
    console.error('Middleware error:', error);
    // Optionally report to error tracking
    Sentry.captureException(error);
  }
};
```

### 3. Avoid Modifying Context 🚫

Context is read-only. Don't try to modify it.

```typescript
// ❌ Bad: Mutating context
const mutatingMiddleware: Middleware = (context) => {
  context.config.priority = 999; // DON'T DO THIS!
};

// ✅ Good: Read-only access
const readonlyMiddleware: Middleware = (context) => {
  const priority = context.config?.priority || 0;
  logPriority(priority);
};
```

### 4. Use Early Returns 🎯

Skip unnecessary work with early returns:

```typescript
const conditionalMiddleware: Middleware = (context) => {
  // Skip if not interested in this action
  if (context.action !== 'add') {
    return;
  }
  
  // Skip if no config
  if (!context.config) {
    return;
  }
  
  // Skip low-priority blockers
  if (context.config.priority < 50) {
    return;
  }
  
  // Now process
  trackHighPriorityBlocker(context);
};
```

### 5. Batch Operations 📦

For high-frequency events, consider batching:

```typescript
function createBatchedMiddleware(flushInterval: number): Middleware {
  let batch: MiddlewareContext[] = [];
  
  setInterval(() => {
    if (batch.length > 0) {
      consolelog(`Processing ${batch.length} events`);
      sendBatch(batch);
      batch = [];
    }
  }, flushInterval);
  
  return (context) => {
    batch.push(context);
  };
}

const batched = createBatchedMiddleware(5000); // Flush every 5s
```

## Testing Middleware

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('customMiddleware', () => {
  it('logs add events', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    customMiddleware({
      action: 'add',
      blockerId: 'test',
      config: { scope: 'form' },
      timestamp: Date.now(),
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Blocker added: test');
  });
  
  it('handles errors gracefully', () => {
    expect(() => {
      customMiddleware({
        action: 'add',
        blockerId: null as any, // Invalid
        timestamp: Date.now(),
      });
    }).not.toThrow();
  });
});
```

### Integration Tests

```typescript
import { render } from '@testing-library/react';
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

describe('middleware integration', () => {
  it('calls middleware on blocker add', () => {
    const mockMiddleware = vi.fn();
    
    const { result } = renderHook(
      () => useBlocker('test', { scope: 'form' }),
      {
        wrapper: ({ children }) => (
          <UIBlockingProvider middlewares={[mockMiddleware]}>
            {children}
          </UIBlockingProvider>
        ),
      }
    );
    
    expect(mockMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'add',
        blockerId: 'test',
      })
    );
  });
});
```

## Troubleshooting

### Middleware Not Firing

**Problem:** Middleware doesn't seem to execute.

**Solutions:**
1. Check registration: `configureMiddleware([myMiddleware])`
2. If using Provider, pass `middlewares` prop
3. Verify blocker is actually being added/removed
4. Check for early returns in your middleware

### Performance Issues

**Problem:** UI feels slow after adding middleware.

**Solutions:**
1. Profile middleware execution time
2. Move heavy work to async operations
3. Add debouncing/throttling
4. Consider batching events

### Duplicate Events

**Problem:** Middleware fires multiple times for same blocker.

**Solutions:**
1. Check if blocker is being added/removed repeatedly
2. Use `useEffect` dependencies correctly in hooks
3. Add deduplication logic in middleware

## Next Steps

- [API Reference: Middleware](../api/middleware) - Complete API documentation
- [API Reference: Store](../api/store) - Manual middleware registration
- [Architecture: Middleware System](../architecture#middleware-system) - Implementation details
- [Examples: Advanced Patterns](../examples/advanced-patterns) - More middleware examples
