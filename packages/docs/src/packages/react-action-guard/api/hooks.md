# Hooks API Reference

Complete API reference for all React Action Guard hooks.

## Core Hooks

### useBlocker

Automatically adds a blocker when the component mounts and removes it on unmount.

```typescript
function useBlocker(
  blockerId: string,
  config: BlockerConfig,
  isActive?: boolean
): void
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `blockerId` | `string` | required | Unique identifier for the blocker |
| `config` | `BlockerConfig` | required | Configuration object |
| `isActive` | `boolean` | `true` | Whether the blocker is active |

**BlockerConfig:**

```typescript
interface BlockerConfig {
  scope?: string | string[];      // Scope(s) to block (default: 'global')
  reason?: string;                 // Human-readable reason
  priority?: number;               // Priority level (default: 10)
  timeout?: number;                // Auto-remove after N milliseconds
  onTimeout?: (blockerId: string) => void; // Callback when timed out
}
```

**Examples:**

```tsx
// Basic usage
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);
  
  useBlocker('save-button', {
    scope: 'form',
    reason: 'Saving data...',
  }, isSaving);
  
  return <button onClick={() => setIsSaving(true)}>Save</button>;
}

// With timeout
function ApiCall() {
  useBlocker('api-call', {
    scope: 'global',
    timeout: 30000,
    onTimeout: (id) => {
      console.warn(`${id} timed out`);
      showNotification('Request timed out');
    }
  }, isLoading);
}

// Multiple scopes
function CriticalOperation() {
  useBlocker('critical', {
    scope: ['form', 'navigation', 'checkout'],
    priority: 100,
    reason: 'Critical operation in progress',
  }, isRunning);
}

// Conditional blocking
function ConditionalBlocker() {
  const shouldBlock = isLoading || hasUnsavedChanges;
  
  useBlocker('conditional', {
    scope: 'form',
  }, shouldBlock);
}
```

**Behavior:**

- Adding same `blockerId` **replaces** existing blocker (no duplicates)
- When `isActive` becomes `false`, blocker is removed
- Blocker is automatically removed on component unmount
- If timeout specified, timer starts when blocker is added
- Re-adding with same ID restarts the timeout

**Performance:**

Uses shallow comparison for config changes. Only re-registers blocker when:
- `blockerId` changes
- `isActive` changes
- Any config property changes

**Related:**
- [useIsBlocked](#useisblocked) - Check if blocked
- [useBlockingInfo](#useblockinginfo) - Get blocker details
- [useAsyncAction](#useasyncaction) - Async wrapper alternative

---

### useIsBlocked

Checks if a specific scope (or scopes) is currently blocked.

```typescript
function useIsBlocked(scope?: string | string[]): boolean
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | `string \| string[]` | `'global'` | Scope(s) to check |

**Returns:** `boolean` - `true` if ANY of the specified scopes are blocked

**Examples:**

```tsx
// Check single scope
function SubmitButton() {
  const isBlocked = useIsBlocked('form');
  
  return (
    <button disabled={isBlocked}>
      {isBlocked ? 'Blocked...' : 'Submit'}
    </button>
  );
}

// Check multiple scopes (ANY match)
function NavigationButton() {
  // Returns true if EITHER 'navigation' OR 'global' is blocked
  const isBlocked = useIsBlocked(['navigation', 'global']);
  
  return <Link disabled={isBlocked}>Next Page</Link>;
}

// Check default (global)
function App() {
  const isGloballyBlocked = useIsBlocked();
  
  return (
    <>
      {isGloballyBlocked && <LoadingOverlay />}
      <Content />
    </>
  );
}

// Conditional rendering
function Form() {
  const isFormBlocked = useIsBlocked('form');
  
  return (
    <form>
      {isFormBlocked && (
        <div className="blocking-overlay">
          Form is blocked
        </div>
      )}
      <input disabled={isFormBlocked} />
    </form>
  );
}
```

**Blocking Rules:**

1. Scope matches exactly: `useIsBlocked('form')` → blocked if blocker has `scope: 'form'`
2. Multiple scopes: `useIsBlocked(['form', 'nav'])` → blocked if ANY match
3. Global scope: `'global'` scope blocks everything
4. Checking global: `useIsBlocked('global')` → blocked if ANY blocker exists

**Performance:**

- Uses shallow equality (return value only changes when blocking state changes)
- Efficient O(n) check through active blockers
- Component only re-renders when result changes

**Related:**
- [useBlockingInfo](#useblockinginfo) - Get detailed information
- [useBlocker](#useblocker) - Add blocker

---

### useBlockingInfo

Gets detailed information about all active blockers for a specific scope.

```typescript
function useBlockingInfo(scope?: string): ReadonlyArray<BlockerInfo>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | `string` | `'global'` | Scope to get information for |

**Returns:** `ReadonlyArray<BlockerInfo>` - Array of blocker information, sorted by priority (highest first), then timestamp (oldest first)

**BlockerInfo:**

```typescript
interface BlockerInfo {
  id: string;                      // Unique identifier
  reason: string;                  // Human-readable reason
  priority: number;                // Priority level
  scope: string | string[];        // Scope(s) being blocked
  timestamp: number;               // When added (ms since epoch)
  timeout?: number;                // Optional timeout duration
}
```

**Examples:**

```tsx
// Display top blocker reason
function BlockingStatus() {
  const blockers = useBlockingInfo('global');
  
  if (blockers.length === 0) {
    return null;
  }
  
  const topBlocker = blockers[0]; // Highest priority
  
  return (
    <div className="blocking-banner">
      <Icon />
      <span>{topBlocker.reason}</span>
      <small>Priority: {topBlocker.priority}</small>
    </div>
  );
}

// Show all blockers
function BlockerList() {
  const blockers = useBlockingInfo('form');
  
  return (
    <ul>
      {blockers.map((blocker) => (
        <li key={blocker.id}>
          <strong>{blocker.reason}</strong>
          <span>Priority: {blocker.priority}</span>
          <span>Since: {new Date(blocker.timestamp).toLocaleTimeString()}</span>
        </li>
      ))}
    </ul>
  );
}

// Conditional UI based on blocker count
function Dashboard() {
  const blockers = useBlockingInfo('global');
  
  return (
    <div>
      {blockers.length > 0 && (
        <Alert severity={blockers.length > 3 ? 'error' : 'warning'}>
          {blockers.length} operation(s) in progress
        </Alert>
      )}
      <Content />
    </div>
  );
}

// Access blocker metadata
function DetailedStatus() {
  const blockers = useBlockingInfo('checkout');
  
  if (blockers.length === 0) {
    return null;
  }
  
  const hasTimeout = blockers.some(b => b.timeout);
  const maxPriority = Math.max(...blockers.map(b => b.priority));
  
  return (
    <div>
      <p>{blockers.length} blocker(s) active</p>
      <p>Highest priority: {maxPriority}</p>
      {hasTimeout && <p>⏱️ Some have timeouts</p>}
    </div>
  );
}
```

**Sorting:**

Blockers are sorted by:
1. **Priority** (descending) - Higher priority first
2. **Timestamp** (ascending) - Older first (tie-breaker)

This ensures the most important blocker is always first.

**Performance:**

- Filters and sorts on every call
- Use sparingly if many blockers exist
- Consider memoizing the result if used multiple times

**Related:**
- [useIsBlocked](#useisblocked) - Simple boolean check
- [useBlocker](#useblocker) - Add blocker

---

### useAsyncAction

Wraps an async function with automatic blocking/unblocking.

```typescript
function useAsyncAction(
  actionId: string,
  scope?: string | string[],
  options?: UseAsyncActionOptions
): <T>(asyncFn: () => Promise<T>) => Promise<T>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `actionId` | `string` | required | Identifier for the action |
| `scope` | `string \| string[]` | `'global'` | Scope(s) to block |
| `options` | `UseAsyncActionOptions` | `{}` | Optional configuration |

**UseAsyncActionOptions:**

```typescript
interface UseAsyncActionOptions {
  timeout?: number;                // Auto-remove after N milliseconds
  onTimeout?: (actionId: string) => void; // Callback when timed out
  priority?: number;               // Priority level (default: 10)
  reason?: string;                 // Blocker reason
}
```

**Returns:** Wrapper function that accepts an async function and returns a Promise

**Examples:**

```tsx
// Basic usage
function DataFetcher() {
  const executeWithBlocking = useAsyncAction('fetch-data', 'content');
  
  const fetchData = () => executeWithBlocking(async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    setData(data);
  });
  
  return <button onClick={fetchData}>Fetch Data</button>;
}

// With timeout
function ApiCall() {
  const execute = useAsyncAction('api-call', 'global', {
    timeout: 30000,
    reason: 'Calling API...',
    onTimeout: (id) => {
      showError('Request timed out');
    }
  });
  
  const callApi = () => execute(async () => {
    await apiClient.post('/endpoint', data);
  });
  
  return <button onClick={callApi}>Submit</button>;
}

// Multiple scopes
function CriticalAction() {
  const execute = useAsyncAction('critical', ['form', 'navigation'], {
    priority: 100,
    reason: 'Critical operation',
  });
  
  const handleAction = () => execute(async () => {
    await performCriticalOperation();
  });
  
  return <button onClick={handleAction}>Execute</button>;
}

// Return value handling
function DataUpdater() {
  const execute = useAsyncAction('update', 'form');
  
  const updateData = async () => {
    const result = await execute(async () => {
      const response = await api.update(data);
      return response.data;
    });
    
    console.log('Update result:', result);
    return result;
  };
  
  return <button onClick={updateData}>Update</button>;
}

// Error handling
function ErrorHandling() {
  const execute = useAsyncAction('error-test', 'global');
  
  const handleAction = async () => {
    try {
      await execute(async () => {
        throw new Error('Oops!');
      });
    } catch (error) {
      console.error('Action failed:', error);
      showNotification('Operation failed');
    }
  };
  
  return <button onClick={handleAction}>Test Error</button>;
}
```

**Behavior:**

1. Blocker is added **before** async function executes
2. Async function is called
3. Blocker is removed **after** function completes (success or error)
4. If timeout occurs during execution, blocker is removed and `onTimeout` is called
5. Original return value is preserved
6. Errors are re-thrown after cleanup

**Lifecycle:**

```typescript
// Pseudo-code
async function wrappedFunction() {
  addBlocker(actionId, config);  // 1. Add blocker
  
  try {
    const result = await asyncFn();  // 2. Execute function
    return result;                   // 3. Return result
  } finally {
    removeBlocker(actionId);       // 4. Always cleanup
  }
}
```

**Performance:**

- Wrapper function is stable (doesn't change between renders)
- Only recreates when `actionId`, `scope`, or `options` change
- Safe to use in `useCallback` dependencies

**Related:**
- [useBlocker](#useblocker) - Manual blocking
- [useConfirmableBlocker](#useconfirmableblocker) - With confirmation

---

## Advanced Hooks

### useConfirmableBlocker

Creates a confirmable action with UI blocking while dialog is open or action is running.

```typescript
function useConfirmableBlocker(
  blockerId: string,
  config: ConfirmableBlockerConfig
): UseConfirmableBlockerReturn
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blockerId` | `string` | Unique identifier |
| `config` | `ConfirmableBlockerConfig` | Configuration with confirm dialog settings |

**ConfirmableBlockerConfig:**

```typescript
interface ConfirmableBlockerConfig extends BlockerConfig {
  confirmMessage: string;           // Message in dialog
  confirmTitle?: string;            // Dialog title (default: 'Confirm Action')
  confirmButtonText?: string;       // Confirm button (default: 'Confirm')
  cancelButtonText?: string;        // Cancel button (default: 'Cancel')
  onConfirm: () => void | Promise<void>; // Action on confirm
  onCancel?: () => void;            // Action on cancel
}
```

**Returns:**

```typescript
interface UseConfirmableBlockerReturn {
  execute: () => void;              // Opens confirmation dialog
  isDialogOpen: boolean;            // Dialog state
  isExecuting: boolean;             // Action running state
  confirmConfig: ConfirmDialogConfig; // UI-ready config
  onConfirm: () => Promise<void>;   // Wire to dialog confirm
  onCancel: () => void;             // Wire to dialog cancel
}
```

**Examples:**

```tsx
// Unsaved changes warning
function FormWithWarning() {
  const [hasChanges, setHasChanges] = useState(false);
  
  const {
    execute,
    isDialogOpen,
    isExecuting,
    confirmConfig,
    onConfirm,
    onCancel,
  } = useConfirmableBlocker('unsaved-changes', {
    scope: 'navigation',
    reason: 'Unsaved changes',
    confirmMessage: 'You have unsaved changes. Discard them?',
    confirmTitle: 'Unsaved Changes',
    confirmButtonText: 'Discard',
    cancelButtonText: 'Keep Editing',
    onConfirm: () => {
      setFormData({});
      setHasChanges(false);
      navigate('/away');
    },
    onCancel: () => {
      console.log('User chose to keep editing');
    }
  });
  
  return (
    <>
      <form onChange={() => setHasChanges(true)}>
        {/* form fields */}
      </form>
      
      <button onClick={execute} disabled={!hasChanges}>
        Leave Page
      </button>
      
      {isDialogOpen && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
      
      {isExecuting && <LoadingOverlay />}
    </>
  );
}

// Delete confirmation
function DeleteButton({ itemId }) {
  const { execute, isDialogOpen, confirmConfig, onConfirm, onCancel } =
    useConfirmableBlocker(`delete-${itemId}`, {
      scope: 'global',
      priority: 100,
      confirmMessage: 'Are you sure you want to delete this item?',
      confirmTitle: 'Delete Item',
      confirmButtonText: 'Delete',
      onConfirm: async () => {
        await api.delete(`/items/${itemId}`);
        showNotification('Item deleted');
      }
    });
  
  return (
    <>
      <button onClick={execute} className="danger">Delete</button>
      {isDialogOpen && (
        <ConfirmDialog {...confirmConfig} onConfirm={onConfirm} onCancel={onCancel} />
      )}
    </>
  );
}

// Async confirm action
function AsyncConfirm() {
  const { execute, isDialogOpen, isExecuting, confirmConfig, onConfirm, onCancel } =
    useConfirmableBlocker('async-action', {
      scope: ['form', 'navigation'],
      confirmMessage: 'Proceed with async operation?',
      onConfirm: async () => {
        // This async function blocks UI while running
        await performLongOperation();
        await saveResults();
      }
    });
  
  return (
    <>
      <button onClick={execute}>Start Operation</button>
      {isDialogOpen && <Dialog {...confirmConfig} onConfirm={onConfirm} onCancel={onCancel} />}
      {isExecuting && <Spinner />}
    </>
  );
}
```

**Blocking Behavior:**

1. **Dialog Open**: UI is blocked while dialog is visible
2. **Executing**: UI remains blocked while `onConfirm` runs
3. **Both**: Blocker persists during dialog + execution

**State Machine:**

```
Idle → [execute()] → Dialog Open (blocked)
  ↓ [cancel]           ↓ [confirm]
Idle ←────────── Executing (blocked)
                        ↓ [complete/error]
                      Idle
```

**Related:**
- [useScheduledBlocker](#usescheduledblocker) - Time-based blocking
- [useConditionalBlocker](#useconditionalblockerblocker) - Condition-based blocking

---

### useScheduledBlocker

Blocks UI during a scheduled time period or maintenance window.

```typescript
function useScheduledBlocker(
  blockerId: string,
  config: ScheduledBlockerConfig
): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blockerId` | `string` | Unique identifier |
| `config` | `ScheduledBlockerConfig` | Schedule configuration |

**ScheduledBlockerConfig:**

```typescript
interface ScheduledBlockerConfig extends BlockerConfig {
  schedule: BlockingSchedule;
  onScheduleStart?: () => void;
  onScheduleEnd?: () => void;
}

interface BlockingSchedule {
  start: string | Date | number;  // Start time
  end?: string | Date | number;   // End time (optional if duration provided)
  duration?: number;               // Duration in ms (takes precedence over end)
}
```

**Examples:**

```tsx
// Maintenance window
function MaintenanceWindow() {
  useScheduledBlocker('maintenance', {
    scope: 'global',
    reason: 'Scheduled maintenance',
    priority: 1000,
    schedule: {
      start: '2024-01-15T02:00:00Z',
      duration: 3600000, // 1 hour
    },
    onScheduleStart: () => {
      console.log('Maintenance started');
      showNotification('System maintenance in progress');
    },
    onScheduleEnd: () => {
      console.log('Maintenance completed');
      showNotification('System is back online');
    }
  });
  
  return <App />;
}

// Feature flag with time window
function TimedFeature() {
  const featureEndTime = new Date('2024-12-31T23:59:59Z');
  
  useScheduledBlocker('feature-expired', {
    scope: 'feature-x',
    reason: 'Feature no longer available',
    schedule: {
      start: featureEndTime,
      // No end = blocks indefinitely after start
    },
    onScheduleStart: () => {
      logAnalytics('feature_expired');
    }
  });
  
  return <FeatureX />;
}

// Business hours blocking
function BusinessHoursOnly() {
  const now = new Date();
  const today9am = new Date(now);
  today9am.setHours(9, 0, 0, 0);
  
  const today5pm = new Date(now);
  today5pm.setHours(17, 0, 0, 0);
  
  // Block outside business hours
  const isAfterHours = now < today9am || now > today5pm;
  
  useScheduledBlocker('after-hours', {
    scope: 'transactions',
    reason: 'Service available 9 AM - 5 PM only',
    schedule: {
      start: isAfterHours ? now : today5pm,
      end: !isAfterHours ? today9am : undefined,
    }
  });
  
  return <TransactionForm />;
}
```

**Time Formats:**

```typescript
// ISO string
schedule: {
  start: '2024-01-15T14:30:00Z',
  end: '2024-01-15T15:30:00Z'
}

// Date object
schedule: {
  start: new Date(2024, 0, 15, 14, 30),
  duration: 3600000 // 1 hour
}

// Timestamp (milliseconds since epoch)
schedule: {
  start: 1705329000000,
  end: 1705332600000
}

// Mixed
schedule: {
  start: new Date(),
  duration: 30 * 60 * 1000 // 30 minutes from now
}
```

**Duration vs End:**

- If `duration` provided: `end = start + duration` (duration takes precedence)
- If `end` provided: Blocks until that time
- If neither: Blocks indefinitely from `start`

**Related:**
- [useConditionalBlocker](#useconditionalBlocker) - Condition-based blocking

---

### useConditionalBlocker

Periodically checks a condition and blocks/unblocks based on the result.

```typescript
function useConditionalBlocker<TState = void>(
  blockerId: string,
  config: ConditionalBlockerConfig<TState>
): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blockerId` | `string` | Unique identifier |
| `config` | `ConditionalBlockerConfig<TState>` | Condition configuration |

**ConditionalBlockerConfig:**

```typescript
interface ConditionalBlockerConfig<TState> extends Omit<BlockerConfig, 'scope'> {
  scope: string | string[];        // Required (not optional)
  condition: (state?: TState) => boolean; // Condition function
  checkInterval?: number;          // Check frequency in ms (default: 1000)
  state?: TState;                  // Optional state passed to condition
}
```

**Examples:**

```tsx
// Network status blocker
function NetworkStatusBlocker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useConditionalBlocker('network-status', {
    scope: ['form', 'navigation'],
    reason: 'No network connection',
    priority: 100,
    condition: () => !isOnline,
    checkInterval: 2000, // Check every 2 seconds
  });
  
  return <App />;
}

// Battery level blocker
function BatteryLevelBlocker() {
  const [battery, setBattery] = useState<any>(null);
  
  useEffect(() => {
    navigator.getBattery?.().then(setBattery);
  }, []);
  
  useConditionalBlocker('low-battery', {
    scope: 'heavy-operations',
    reason: 'Battery too low for this operation',
    priority: 80,
    condition: () => {
      return battery && battery.level < 0.2 && !battery.charging;
    },
    checkInterval: 5000,
  });
  
  return <App />;
}

// Form validation blocker
function FormValidationBlocker() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  useConditionalBlocker('validation', {
    scope: 'form-submit',
    reason: 'Form validation failed',
    condition: (state) => {
      if (!state) {
        return false;
      }
      return !state.name || !state.email || state.age < 18;
    },
    state: formState,
    checkInterval: 500,
  });
  
  return <Form state={formState} onChange={setFormState} />;
}

// Custom business logic
function BusinessRuleBlocker() {
  const { user, cart } = useAppState();
  
  useConditionalBlocker('business-rule', {
    scope: 'checkout',
    reason: 'Business rule violation',
    priority: 90,
    condition: () => {
      // Complex business logic
      if (!user.emailVerified) {
        return true;
      }
      if (cart.total > user.creditLimit) {
        return true;
      }
      if (cart.items.some(item => !item.inStock)) {
        return true;
      }
      return false;
    },
    checkInterval: 1000,
  });
  
  return <Checkout />;
}
```

**Behavior:**

1. Condition is checked immediately on mount
2. Then checked every `checkInterval` milliseconds
3. If condition returns `true`: blocker is added
4. If condition returns `false`: blocker is removed
5. Interval clears on unmount

**Performance:**

- Use reasonable `checkInterval` values (not too frequent)
- Keep condition function fast (avoid heavy computation)
- Consider using `state` parameter instead of closures

**Tips:**

- **Don't**: Check external state without passing it as `state`
- **Do**: Pass dependencies explicitly for proper updates
- **Don't**: Use very short intervals (< 100ms) - battery drain
- **Do**: Use appropriate intervals for your use case

**Related:**
- [useScheduledBlocker](#usescheduledblocker) - Time-based blocking
- [useBlocker](#useblocker) - Manual control

---

## Summary

**Choose the right hook:**

| Use Case | Hook |
|----------|------|
| Manual blocking control | `useBlocker` |
| Check if blocked | `useIsBlocked` |
| Get blocker details | `useBlockingInfo` |
| Wrap async function | `useAsyncAction` |
| Need confirmation | `useConfirmableBlocker` |
| Time-based blocking | `useScheduledBlocker` |
| Condition-based blocking | `useConditionalBlocker` |

**Next Steps:**

- [Store API](./store) - Direct store access
- [Middleware API](./middleware) - Extend functionality
- [Types](./types) - TypeScript types
