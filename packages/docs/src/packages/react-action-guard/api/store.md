# Store API Reference

Direct access to the Zustand store for advanced use cases.

## Overview

The store provides low-level access to the blocking state and actions. Most use cases are covered by [hooks](./hooks), but the store API is useful for:

- Non-React contexts (tests, utilities, event handlers)
- Direct state manipulation
- Custom integrations
- Performance-critical code

## Store Access

### useUIBlockingStore

React hook for accessing the store with a selector.

```typescript
function useUIBlockingStore<T>(
  selector: (state: UIBlockingStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | `(state) => T` | required | Extract part of state |
| `equalityFn` | `(a, b) => boolean` | shallow | Custom equality check |

**Examples:**

```tsx
// Select single method
function MyComponent() {
  const addBlocker = useUIBlockingStore(state => state.addBlocker);
  const removeBlocker = useUIBlockingStore(state => state.removeBlocker);
  
  const handleClick = () => {
    addBlocker('my-blocker', { scope: 'global' });
    
    setTimeout(() => {
      removeBlocker('my-blocker');
    }, 3000);
  };
  
  return <button onClick={handleClick}>Block for 3s</button>;
}

// Select multiple values (use object for shallow comparison)
function AdvancedComponent() {
  const { addBlocker, updateBlocker, isBlocked } = useUIBlockingStore(
    state => ({
      addBlocker: state.addBlocker,
      updateBlocker: state.updateBlocker,
      isBlocked: state.isBlocked,
    })
  );
  
  // ...
}

// Access entire store (avoid - causes re-renders on any change)
function DebugComponent() {
  const store = useUIBlockingStore(state => state);
  
  return <pre>{JSON.stringify(store.blockers, null, 2)}</pre>;
}
```

### uiBlockingStoreApi

Non-hook API for contexts outside React components.

```typescript
const uiBlockingStoreApi: StoreApi<UIBlockingStore>
```

**Methods:**

- `getState()` - Get current state
- `setState()` - Update state (use carefully!)
- `subscribe()` - Listen to changes
- `destroy()` - Cleanup store

**Examples:**

```typescript
// In tests
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

test('blocker lifecycle', () => {
  const store = uiBlockingStoreApi.getState();
  
  store.addBlocker('test', { scope: 'global' });
  expect(store.isBlocked('global')).toBe(true);
  
  store.removeBlocker('test');
  expect(store.isBlocked('global')).toBe(false);
});

// In utility functions
function logBlockers() {
  const state = uiBlockingStoreApi.getState();
  const blockers = Array.from(state.blockers.values());
  
  console.log('Active blockers:', blockers);
}

// In event handlers (outside React)
document.addEventListener('offline', () => {
  uiBlockingStoreApi.getState().addBlocker('offline', {
    scope: 'global',
    reason: 'No internet connection',
    priority: 1000,
  });
});

document.addEventListener('online', () => {
  uiBlockingStoreApi.getState().removeBlocker('offline');
});

// Subscribe to changes
const unsubscribe = uiBlockingStoreApi.subscribe((state, prevState) => {
  console.log('Blockers changed:', state.blockers);
});

// Cleanup
unsubscribe();
```

## Store Interface

```typescript
interface UIBlockingStore extends UIBlockingStoreState, UIBlockingStoreActions {}

interface UIBlockingStoreState {
  blockers: Map<string, StoredBlocker>;
}

interface UIBlockingStoreActions {
  // Core operations
  addBlocker(id: string, config: BlockerConfig): void;
  removeBlocker(id: string): void;
  updateBlocker(id: string, config: Partial<BlockerConfig>): void;
  
  // Queries
  isBlocked(scope?: string | string[]): boolean;
  getBlockingInfo(scope?: string): ReadonlyArray<BlockerInfo>;
  
  // Bulk operations
  clearAllBlockers(): void;
  clearBlockersForScope(scope: string): void;
  
  // Middleware
  registerMiddleware(name: string, middleware: Middleware): void;
  unregisterMiddleware(name: string): void;
}
```

## Actions

### addBlocker

Add or replace a blocker.

```typescript
addBlocker(id: string, config: BlockerConfig): void
```

**Behavior:**

- If blocker with `id` exists, it's **replaced** (not merged)
- Existing timeout is cleared
- New timeout is started (if configured)
- Middleware `"add"` event is emitted

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Basic
store.addBlocker('save', {
  scope: 'form',
  reason: 'Saving...',
});

// With priority
store.addBlocker('critical', {
  scope: 'global',
  priority: 100,
  reason: 'Critical operation',
});

// With timeout
store.addBlocker('api-call', {
  scope: 'global',
  timeout: 30000,
  onTimeout: (id) => {
    console.warn(`${id} timed out`);
  }
});

// Multiple scopes
store.addBlocker('checkout', {
  scope: ['form', 'navigation', 'payment'],
  priority: 80,
  reason: 'Processing checkout',
});
```

**Re-adding Same ID:**

```typescript
// First add
store.addBlocker('test', {
  scope: 'form',
  priority: 10,
});

// Second add - REPLACES first one
store.addBlocker('test', {
  scope: 'global',  // Different scope
  priority: 20,      // Different priority
});

// Blocker now has: scope='global', priority=20
```

---

### removeBlocker

Remove a blocker by ID.

```typescript
removeBlocker(id: string): void
```

**Behavior:**

- Removes blocker from store
- Clears any active timeout
- Middleware `"remove"` event is emitted
- No-op if blocker doesn't exist

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Remove single blocker
store.removeBlocker('save');

// Remove in async function
async function saveData() {
  store.addBlocker('save', { scope: 'form' });
  try {
    await api.save(data);
  } finally {
    store.removeBlocker('save'); // Always cleanup
  }
}

// Remove in event handler
button.addEventListener('click', () => {
  store.removeBlocker('loading');
});
```

---

### updateBlocker

Update blocker metadata without changing ID.

```typescript
updateBlocker(id: string, config: Partial<BlockerConfig>): void
```

**Behavior:**

- Merges new config with existing blocker
- If `timeout` is in config, timer is **restarted**
- If `timeout` not in config, existing timer continues
- Set `timeout: 0` to clear an existing timeout
- Middleware `"update"` event is emitted
- No-op if blocker doesn't exist

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Update priority
store.addBlocker('task', {
  scope: 'global',
  priority: 10,
});

store.updateBlocker('task', {
  priority: 50, // Increase priority
});

// Update reason
store.updateBlocker('task', {
  reason: 'Processing step 2/3',
});

// Restart timeout
store.updateBlocker('task', {
  timeout: 60000, // Reset to 60 seconds
});

// Clear timeout
store.updateBlocker('task', {
  timeout: 0, // Remove timeout
});

// Update multiple properties
store.updateBlocker('task', {
  priority: 100,
  reason: 'Almost done',
  scope: ['global', 'critical'],
});
```

**Timeout Behavior:**

```typescript
// Initial add with 10s timeout
store.addBlocker('test', {
  scope: 'global',
  timeout: 10000,
});

// Update priority - timeout continues
store.updateBlocker('test', {
  priority: 50,
});

// Update timeout - timer RESTARTS
store.updateBlocker('test', {
  timeout: 20000, // Now expires in 20s from now
});

// Clear timeout
store.updateBlocker('test', {
  timeout: 0,
});
```

---

### isBlocked

Check if a scope is currently blocked.

```typescript
isBlocked(scope?: string | string[]): boolean
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | `string \| string[]` | `'global'` | Scope(s) to check |

**Returns:** `true` if ANY blocker matches ANY of the specified scopes

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Check single scope
if (store.isBlocked('form')) {
  console.log('Form is blocked');
}

// Check multiple scopes (ANY match)
if (store.isBlocked(['form', 'navigation'])) {
  console.log('Either form or navigation is blocked');
}

// Check global (default)
if (store.isBlocked()) {
  console.log('Something is blocked');
}

// Conditional logic
const canSubmit = !store.isBlocked('form') && formIsValid;
```

**Scope Matching:**

```typescript
// Add blocker with 'form' scope
store.addBlocker('save', { scope: 'form' });

store.isBlocked('form');     // true
store.isBlocked('navigation'); // false
store.isBlocked();           // true (global check, ANY blocker exists)

// Add blocker with global scope
store.addBlocker('critical', { scope: 'global' });

store.isBlocked('form');       // true (global blocks everything)
store.isBlocked('navigation'); // true (global blocks everything)
store.isBlocked('anything');   // true (global blocks everything)
```

---

### getBlockingInfo

Get detailed information about blockers for a scope.

```typescript
getBlockingInfo(scope?: string): ReadonlyArray<BlockerInfo>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | `string` | `'global'` | Scope to get information for |

**Returns:** Array of `BlockerInfo` sorted by:
1. Priority (descending)
2. Timestamp (ascending)

**BlockerInfo:**

```typescript
interface BlockerInfo {
  id: string;
  reason: string;
  priority: number;
  scope: string | string[];
  timestamp: number;
  timeout?: number;
}
```

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Get all blockers for scope
const formBlockers = store.getBlockingInfo('form');
console.log(`${formBlockers.length} blocker(s) for form`);

// Get highest priority blocker
const topBlocker = formBlockers[0];
if (topBlocker) {
  console.log(`Top blocker: ${topBlocker.reason} (priority: ${topBlocker.priority})`);
}

// Check for specific blocker
const hasTimeout = formBlockers.some(b => b.timeout);
if (hasTimeout) {
console.log('Some blockers have timeouts');
}

// Display all reasons
formBlockers.forEach(blocker => {
  console.log(`- ${blocker.reason} (${blocker.id})`);
});
```

---

### clearAllBlockers

Remove all blockers from all scopes.

```typescript
clearAllBlockers(): void
```

**Behavior:**

- Removes ALL blockers
- Clears ALL timeouts
- Middleware `"clear"` event is emitted with count
- Use sparingly (nuclear option)

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Clear all on page unload
window.addEventListener('beforeunload', () => {
  store.clearAllBlockers();
});

// Clear all after error
try {
  await criticalOperation();
} catch (error) {
  console.error('Critical error', error);
  store.clearAllBlockers(); // Reset everything
}

// Clear all in tests
afterEach(() => {
  uiBlockingStoreApi.getState().clearAllBlockers();
});
```

**Middleware Event:**

```typescript
// Middleware receives count
middleware((context) => {
  if (context.action === 'clear') {
    console.log(`Cleared ${context.count} blocker(s)`);
  }
});
```

---

### clearBlockersForScope

Remove all blockers for a specific scope.

```typescript
clearBlockersForScope(scope: string): void
```

**Behavior:**

- Removes blockers matching the scope
- Clears timeouts for removed blockers
- Middleware `"clear_scope"` event is emitted with scope and count

**Examples:**

```typescript
const store = useUIBlockingStore(state => state);

// Clear all form blockers
store.clearBlockersForScope('form');

// Clear on navigation
useEffect(() => {
  return () => {
    store.clearBlockersForScope('page-specific');
  };
}, [location]);

// Clear category
function clearCategory(category: string) {
  store.clearBlockersForScope(`category-${category}`);
}
```

**Middleware Event:**

```typescript
middleware((context) => {
  if (context.action === 'clear_scope') {
    console.log(`Cleared ${context.count} blocker(s) from scope: ${context.scope}`);
  }
});
```

---

### registerMiddleware

Register a middleware function.

```typescript
registerMiddleware(name: string, middleware: Middleware): void
```

[See Middleware API →](./middleware)

---

### unregisterMiddleware

Unregister a middleware by name.

```typescript
unregisterMiddleware(name: string): void
```

[See Middleware API →](./middleware)

---

## Advanced Patterns

### Custom Hook with Store

```typescript
function useCustomBlocking() {
  const store = useUIBlockingStore(state => ({
    add: state.addBlocker,
    remove: state.removeBlocker,
    isBlocked: state.isBlocked,
  }));
  
  const blockTemporarily = useCallback((id: string, duration: number) => {
    store.add(id, { scope: 'global', timeout: duration });
  }, [store]);
  
  return {
    blockTemporarily,
    isBlocked: store.isBlocked,
  };
}
```

### Direct State Access

```typescript
function getBlockerCount(): number {
  const state = uiBlockingStoreApi.getState();
  return state.blockers.size;
}

function getBlockerIds(): string[] {
  const state = uiBlockingStoreApi.getState();
  return Array.from(state.blockers.keys());
}

function hasBlocker(id: string): boolean {
  const state = uiBlockingStoreApi.getState();
  return state.blockers.has(id);
}
```

### Batch Operations

```typescript
function blockMultiple(ids: string[], config: BlockerConfig) {
  const store = uiBlockingStoreApi.getState();
  
  ids.forEach(id => {
    store.addBlocker(id, config);
  });
}

function removeMultiple(ids: string[]) {
  const store = uiBlockingStoreApi.getState();
  
  ids.forEach(id => {
    store.removeBlocker(id);
  });
}
```

## Performance Considerations

### Selector Optimization

```typescript
// ❌ Bad: Creates new object every render
const methods = useUIBlockingStore(state => ({
  add: state.addBlocker,
  remove: state.removeBlocker,
}));

// ✅ Good: Separate selectors
const add = useUIBlockingStore(state => state.addBlocker);
const remove = useUIBlockingStore(state => state.removeBlocker);

// ✅ Also good: Memoized selector
const selectMethods = useCallback(
  (state) => ({
    add: state.addBlocker,
    remove: state.removeBlocker,
  }),
  []
);
const methods = useUIBlockingStore(selectMethods);
```

### Avoid Unnecessary Subscriptions

```typescript
// ❌ Bad: Subscribes to entire store
function Component() {
  const store = useUIBlockingStore(state => state);
  // Re-renders on ANY store change
}

// ✅ Good: Subscribe to specific value
function Component() {
  const isBlocked = useUIBlockingStore(state => state.isBlocked('form'));
  // Only re-renders when this specific value changes
}
```

## Related

- [Hooks API](./hooks) - Higher-level hooks
- [Middleware API](./middleware) - Extend functionality
- [Architecture](../architecture) - How store works internally
