# Best Practices

Recommended patterns and guidelines for using React Action Guard effectively.

## General Principles

### 1. Use Specific Scopes

```typescript
// ❌ Bad: Always blocking global
useBlocker('save', { scope: 'global' }, isSaving);

// ✅ Good: Block specific scope
useBlocker('save', { scope: 'form' }, isSaving);
```

**Why:** Blocking `'global'` prevents all interactions. Use specific scopes to block only what's necessary.

### 2. Add Timeouts for Safety

```typescript
// ❌ Bad: No timeout (risk of infinite blocking)
useBlocker('api-call', { scope: 'form' }, isLoading);

// ✅ Good: Timeout prevents infinite blocking
useBlocker('api-call', {
  scope: 'form',
  timeout: 30000, // 30 seconds
  onTimeout: (id) => {
    showError('Request timed out');
    // Cleanup logic
  }
}, isLoading);
```

**Why:** Network requests can hang. Timeouts prevent users from being stuck.

### 3. Show Feedback to Users

```typescript
// ❌ Bad: UI locked with no indication
useBlocker('save', { scope: 'form' }, isSaving);

// ✅ Good: Clear reason shown
useBlocker('save', {
  scope: 'form',
  reason: 'Saving your changes...',
}, isSaving);

const blockers = useBlockingInfo('form');
return blockers[0] && <div className="status">{blockers[0].reason}</div>;
```

**Why:** Users need to know why the UI is blocked.

### 4. Use Appropriate Priorities

```typescript
// ✅ Priority guidelines:
// 1-10:   Background tasks (sync, prefetch)
// 10-50:  Normal user actions (save, submit)
// 50-90:  Important operations (checkout, payment)
// 90-100: Critical operations (emergency actions)

useBlocker('bg-sync', { priority: 5 }, isSyncing);
useBlocker('form-save', { priority: 10 }, isSaving);
useBlocker('checkout', { priority: 80 }, isCheckout);
```

**Why:** Ensures the most important operations always take precedence.

### 5. Always Cleanup

```typescript
// ❌ Bad: Manual and error-prone
const handleSave = async () => {
  addBlocker('save', { scope: 'form' });
  await save();
  removeBlocker('save'); // Forgotten on error!
};

// ✅ Good: Automatic cleanup
const handleSave = async () => {
  setIsSaving(true);
  try {
    await save();
  } finally {
    setIsSaving(false); // Always runs
  }
};

useBlocker('save', { scope: 'form' }, isSaving);
```

**Why:** Hooks automatically cleanup on unmount. Manual management is error-prone.

## Hook Usage

### useBlocker

**Best:**
```typescript
// Clear, specific, safe
useBlocker('user-save', {
  scope: 'form',
  reason: 'Saving user...',
  priority: 10,
  timeout: 30000,
}, isSaving);
```

**Avoid:**
```typescript
// Too vague, no timeout, no reason
useBlocker('x', { scope: 'global' }, true);
```

### useAsyncAction

**Best:**
```typescript
// For one-off async operations
const execute = useAsyncAction('fetch-data', 'content', {
  timeout: 30000,
  reason:'Loading...',
});

const fetchData = () => execute(async () => {
  const data = await api.fetch();
  setData(data);
});
```

**When:** Single async function that should block UI.

### useBlockingQuery (TanStack)

**Best:**
```typescript
// Don't block background refreshes
const query = useBlockingQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  blockingConfig: {
    scope: 'users',
    reasonOnLoading: 'Loading users...',
    reasonOnFetching: 'Refreshing...',
    onLoading: true,
    onFetching: false, // Don't block background refresh
  }
});
```

**Avoid:**
```typescript
// Always blocking (annoying for users)
blockingConfig: {
  scope: 'global',
  onLoading: true,
  onFetching: true, // Blocks even background refresh
}
```

## Scope Design

### Naming Scopes

```typescript
// ✅ Good: Descriptive names
'user-form'
'checkout-process'
'navigation'
'data-table'
'modal'

// ❌ Bad: Vague names
'x'
'temp'
'loading'
'block'
```

### Scope Hierarchy

```typescript
// Organize scopes by feature/area
const SCOPES = {
  GLOBAL: 'global',
  NAVIGATION: 'navigation',
  FORMS: {
    USER: 'user-form',
    POST: 'post-form',
    SETTINGS: 'settings-form',
  },
  DATA: {
    USERS: 'users-data',
    POSTS: 'posts-data',
  },
} as const;

// Use
useBlocker('save-user', {
  scope: SCOPES.FORMS.USER,
}, isSaving);
```

### Multiple Scopes

```typescript
// Block multiple related areas
useBlocker('critical-op', {
  scope: ['form', 'navigation', 'sidebar'],
  priority: 100,
}, isCritical);
```

**When:** Operation affects multiple UI areas.

## Provider Pattern

### SSR Applications

```typescript
// ✅ Always use provider for SSR
// app/layout.tsx (Next.js)
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UIBlockingProvider>
          {children}
        </UIBlockingProvider>
      </body>
    </html>
  );
}
```

**Why:** Prevents state leaking between requests.

### Testing

```typescript
// ✅ Wrap tests in provider
import { render } from '@testing-library/react';
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

function renderWithProvider(ui) {
  return render(
    <UIBlockingProvider>
      {ui}
    </UIBlockingProvider>
  );
}

test('component works', () => {
  renderWithProvider(<MyComponent />);
  // Clean isolated state per test
});
```

**Why:** Each test gets fresh state, no manual cleanup.

## Middleware

### Development vs Production

```typescript
// ✅ Conditional middleware
const middlewares = [];

if (process.env.NODE_ENV === 'development') {
  middlewares.push(loggerMiddleware);
}

if (process.env.NODE_ENV === 'production') {
  middlewares.push(
    createAnalyticsMiddleware({ provider: 'ga' }),
    createPerformanceMiddleware({ slowBlockThreshold: 5000 })
  );
}

configureMiddleware(middlewares);
```

### Keep Middleware Fast

```typescript
// ❌ Bad: Slow synchronous work
const slowMiddleware: Middleware = (context) => {
  heavyComputation(); // Blocks UI!
  sendToServer(data);
};

// ✅ Good: Async work
const fastMiddleware: Middleware = (context) => {
  Promise.resolve().then(async () => {
    await heavyComputation();
    await sendToServer(data);
  });
};
```

### Error Handling

```typescript
// ✅ Always wrap in try-catch
const safeMiddleware: Middleware = (context) => {
  try {
    processEvent(context);
  } catch (error) {
    console.error('Middleware error:', error);
    Sentry.captureException(error);
  }
};
```

## Error Handling

### Network Errors

```typescript
const execute = useAsyncAction('api-call', 'form', {
  timeout: 30000,
  onTimeout: () => {
    showError('Request timed out');
  }
});

const handleSubmit = async () => {
  try {
    await execute(async () => {
      const response = await api.submit(data);
      if (!response.ok) throw new Error('Submit failed');
    });
    showSuccess('Saved!');
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
};
```

### Timeout Handling

```typescript
useBlocker('long-operation', {
  scope: 'global',
  timeout: 60000,
  onTimeout: (id) => {
    // Cleanup
    cancelOperation();
    
    // User feedback
    showNotification('Operation timed out', 'error');
    
    // Analytics
    trackEvent('operation_timeout', { operation: id });
  }
}, isRunning);
```

## Performance

### Avoid Over-Blocking

```typescript
// ❌ Bad: Everything blocks global
useBlocker('a', { scope: 'global' }, isA);
useBlocker('b', { scope: 'global' }, isB);
useBlocker('c', { scope: 'global' }, isC);

// ✅ Good: Specific scopes
useBlocker('a', { scope: 'section-a' }, isA);
useBlocker('b', { scope: 'section-b' }, isB);
useBlocker('c', { scope: 'section-c' }, isC);
```

### Selector Optimization

```typescript
// ❌ Bad: Selects entire store
const store = useUIBlockingStore(state => state);

// ✅ Good: Selects only what's needed
const isBlocked = useUIBlockingStore(state => state.isBlocked('form'));
```

### Debounce High-Frequency Updates

```typescript
// For rapidly changing blockers
const debouncedUpdate = useMemo(
  () => debounce((value) => {
    updateBlocker('rapid', { reason: `Progress: ${value}%` });
  }, 100),
  []
);
```

## Testing

### Unit Tests

```typescript
import { render, waitFor } from '@testing-library/react';
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

test('blocker works', async () => {
  const { getByRole } = render(
    <UIBlockingProvider>
      <MyComponent />
    </UIBlockingProvider>
  );
  
  const button = getByRole('button');
  expect(button).not.toBeDisabled();
  
  // Trigger blocking
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(button).toBeDisabled();
  });
});
```

### Integration Tests

```typescript
test('form submission blocks UI', async () => {
  const { getByRole, getByText } = render(
    <UIBlockingProvider>
      <Form />
    </UIBlockingProvider>
  );
  
  const submit = getByRole('button', { name: 'Submit' });
  fireEvent.click(submit);
  
  // Check blocking
  expect(submit).toBeDisabled();
  expect(getByText('Submitting...')).toBeInTheDocument();
  
  // Wait for completion
  await waitFor(() => {
    expect(submit).not.toBeDisabled();
  });
});
```

## Security

### Input Validation

```typescript
// Validate blocker IDs
const VALID_ID_REGEX = /^[a-z0-9-]+$/;

function safeBlocker(id: string, config: BlockerConfig, isActive: boolean) {
  if (!VALID_ID_REGEX.test(id)) {
    console.warn(`Invalid blocker ID: ${id}`);
    return;
  }
  
  useBlocker(id, config, isActive);
}
```

### Sensitive Operations

```typescript
// High priority for sensitive operations
useBlocker('delete-account', {
  scope: 'global',
  priority: 1000, // Highest priority
  reason: 'Deleting account...',
  timeout: 30000,
}, isDeleting);
```

## Accessibility

### Screen Reader Support

```typescript
function BlockingStatus() {
  const blockers = useBlockingInfo('global');
  const topBlocker = blockers[0];
  
  return topBlocker ? (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {topBlocker.reason}
    </div>
  ) : null;
}
```

### Keyboard Navigation

```typescript
// Disable focus when blocked
const isBlocked = useIsBlocked('form');

return (
  <div>
    <input disabled={isBlocked} />
    <button disabled={isBlocked} tabIndex={isBlocked ? -1 : 0}>
      Submit
    </button>
  </div>
);
```

## Common Pitfalls

### Pitfall 1: Forgetting Timeouts

```typescript
// ❌ Risk: Infinite blocking if API hangs
useBlocker('api', { scope: 'global' }, isLoading);

// ✅ Safe: Always times out
useBlocker('api', {
  scope: 'global',
  timeout: 30000,
  onTimeout: handleTimeout,
}, isLoading);
```

### Pitfall 2: Blocking Too Much

```typescript
// ❌ Blocks everything unnecessarily
useBlocker('minor-task', { scope: 'global' }, isMinorTask);

// ✅ Blocks only affected area
useBlocker('minor-task', { scope: 'widget' }, isMinorTask);
```

### Pitfall 3: Not Showing Feedback

```typescript
// ❌ User has no idea why UI is blocked
useBlocker('save', { scope: 'form' }, isSaving);

// ✅ Clear feedback
useBlocker('save', {
  scope: 'form',
  reason: 'Saving changes...',
}, isSaving);

const blockers = useBlockingInfo('form');
return blockers[0] && <StatusBar message={blockers[0].reason} />;
```

### Pitfall 4: Manual Store Access

```typescript
// ❌ Bypasses hooks (no cleanup)
const store = uiBlockingStoreApi.getState();
store.addBlocker('test', { scope: 'form' });
// Forgot to remove!

// ✅ Use hooks (automatic cleanup)
useBlocker('test', { scope: 'form' }, isActive);
```

## Checklist

Before deploying:

- [ ] All blockers have meaningful IDs and reasons
- [ ] Timeouts added to network-dependent blockers
- [ ] Using specific scopes, not always 'global'
- [ ] Priorities set appropriately
- [ ] User feedback shown for blocking states
- [ ] Error handling for async operations
- [ ] DevTools removed from production bundle
- [ ] Provider used for SSR applications
- [ ] Tests cover blocking scenarios
- [ ] Accessibility considerations addressed

## Next Steps

- [Examples](/packages/react-action-guard/examples/basic-usage) - See these practices in action
- [Architecture](/architecture/) - Understanding the system
- [API Reference](/packages/react-action-guard/api/hooks) - Complete API docs
