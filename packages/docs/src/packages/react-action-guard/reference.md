# Core reference and recipes

This canonical reference preserves the detailed API and recipes previously carried in the package
README. Reference fragments assume the application's helpers and state; complete independently
compiled examples are in [forms](/guides/forms), [workflows](/guides/workflows),
[registration](/guides/lifecycle), [ownership](/advanced/ownership) and [migration](./migration).
See [generated types](./api/typedoc/README) for the full public declaration surface and the
[Core contract](./contract) for planned stabilization versus published versions.

## 1.0 Migration

`1.0.0` removes public re-exports of internal `react-zustand-toolkit` helpers.
Import `createShallowStore`, `createStoreToolkit`, `createStoreProvider` and
`createResolvedStoreHooks` directly from `@okyrychenko-dev/react-zustand-toolkit`.

## API Reference

### Hooks

#### Core hooks

Start with these first:

- `useAsyncAction`
- `useActionBlocker` (`useBlocker` remains as a backward-compatible alias)
- `useIsBlocked`
- `useBlockingInfo`

#### `useActionBlocker(blockerId, config, isActive?)`

Automatically adds a blocker when the component mounts and removes it on unmount.

Use a unique `blockerId` for each active hook within the resolved store. In development,
concurrent hooks with the same ID in that store emit a warning. Equal IDs in isolated provider
stores are allowed. This diagnostic does not isolate shared-ID registrations: one hook can
still overwrite another's configuration or remove its blocker on cleanup. Production behavior
is unchanged.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: BlockerConfig` - Configuration object
  - `scope?: string | string[]` - Scope(s) to block (default: "global")
  - `reason?: string` - Reason for blocking (for debugging)
  - `priority?: number` - Priority level (higher = more important)
  - `timeout?: number` - Auto-remove after N milliseconds
  - `onTimeout?: (blockerId: string) => void` - Callback when auto-removed
- `isActive?: boolean` - Whether the blocker is active (default: true)

When `isActive` is `true`, changing `config` replaces the current registration configuration without requiring unmount/remount. Omitted optional values clear previous settings; imperative `updateBlocker` remains a partial merge. See [registration lifetime](/guides/lifecycle) for deadline and timeout reactivation rules.

**Example:**

```jsx
function MyComponent() {
  useActionBlocker("my-blocker", {
    scope: "form",
    reason: "Form is saving",
    priority: 10,
  });

  return <div>Content</div>;
}

// With timeout - auto-removes after 30 seconds
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  useActionBlocker(
    "save-operation",
    {
      scope: "form",
      reason: "Saving...",
      timeout: 30000,
      onTimeout: (id) => {
        console.warn(`Blocker ${id} expired; saving may still be running`);
        showNotification("UI blocker expired; check operation status");
      },
    },
    isSaving
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveData();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button onClick={handleSave} disabled={isSaving}>
      Save
    </button>
  );
}
```

#### `useIsBlocked(scope)`

Checks if a specific scope (or scopes) is currently blocked.

**Parameters:**

- `scope?: string | string[]` - Scope(s) to check (default: "global")

**Returns:** `boolean` - Whether the scope is blocked

**Example:**

```jsx
function SubmitButton() {
  const isFormBlocked = useIsBlocked("form");

  return <button disabled={isFormBlocked}>Submit</button>;
}
```

#### `useBlockingInfo(scope)`

Gets detailed information about all active blockers affecting the observed scopes.

**Parameters:**

- `scope?: string | ReadonlyArray<string>` - Scope(s) to observe (default: "global"); an empty array observes nothing

**Returns:** `ReadonlyArray<BlockerInfo>` - Array of blocker information objects, sorted by priority (highest first). Priority orders reasons; every matching active blocker retains protection, including lower-priority ones

The hook retains its frozen result and skips subscription-driven renders when the matching metadata is unchanged. Global blockers affect every nonempty observation. Equal priorities retain registration order.

**BlockerInfo:**

- `id: string` - Unique identifier of the blocker
- `reason: string` - Reason for blocking (defaults to "Unknown")
- `priority: number` - Priority level (higher = higher priority, minimum value is 0)
- `scope: string | string[]` - Scope(s) being blocked
- `timestamp: number` - When the blocker was added (milliseconds since epoch)
- `timeout?: number` - Optional timeout duration in milliseconds
- `onTimeout?: (blockerId: string) => void` - Optional callback when timeout expires

**Example:**

```jsx
function CheckoutButton() {
  const blockers = useBlockingInfo("checkout");

  if (blockers.length > 0) {
    const topBlocker = blockers[0]; // Highest priority blocker
    return (
      <Tooltip content={`Blocked: ${topBlocker.reason}`}>
        <Button disabled>Checkout ({blockers.length} blockers)</Button>
      </Tooltip>
    );
  }

  return <Button>Checkout</Button>;
}
```

#### `useAsyncAction(actionId, scope, options)`

Wraps an async function with automatic blocking/unblocking.

**Parameters:**

- `actionId: string` - Identifier for the action
- `scope?: string | string[]` - Scope(s) to block during execution
- `options?: UseAsyncActionOptions` - Optional configuration
  - `timeout?: number` - Auto-remove blocker after N milliseconds
  - `onTimeout?: (blockerId: string) => void` - Callback when the blocker timeout expires

**Returns:** `(asyncFn: () => Promise<T>) => Promise<T>` - Function wrapper

Each execution receives a unique blocker ID within the resolved store, including concurrent
executions from different hook instances. Separate `UIBlockingProvider` stores allocate IDs
independently. Calls may overlap, even with the same action ID and scope. Each run removes only
its own blocker in `finally` after success or rejection, and returns the operation's result or error.

Caller unmount does not release an in-flight `useAsyncAction` blocker. It remains in the resolved
store until settlement, explicit clearing, or blocker timeout. By contrast, `useActionBlocker`
and the mounted confirmable, scheduled, and conditional hooks release their registrations on
unmount; releasing a blocker does not cancel application work.

`timeout` limits blocker lifetime only. It neither aborts the operation nor resolves or rejects
its promise. After timeout, the operation may still succeed or fail and must still be handled.
A hung operation without timeout or application cleanup can leave its blocker active indefinitely.

**Example:**

```jsx
function MyComponent() {
  const executeWithBlocking = useAsyncAction("save-data", "form");

  const handleSave = async () => {
    await executeWithBlocking(async () => {
      await saveData();
    });
  };

  return <button onClick={handleSave}>Save</button>;
}

// Blocker timeout releases UI even if the operation is still pending
function ApiComponent() {
  const execute = useAsyncAction("api-call", "global", {
    timeout: 60000, // 1 minute blocker lifetime
    onTimeout: (id) => {
      showError("UI blocker expired; the request may still be running.");
    },
  });

  const fetchData = () =>
    execute(async () => {
      const response = await fetch("/api/data");
      return response.json();
    });

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

#### Application-owned cancellation and exclusion

This component owns its `AbortController` and synchronous ref gate. The transport must honor
`signal` for abort to affect the request. The gate stays closed until settlement, even if the
UI blocker expires. A backend may already have accepted a request when the client aborts;
use server-side idempotency where duplicate side effects matter.

```tsx
import { useEffect, useRef, type ReactElement } from "react";
import { useAsyncAction, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

export function PaymentButton(): ReactElement {
  const active = useRef<AbortController | null>(null);
  const run = useAsyncAction<void>("payment", "payment", { timeout: 5000 });
  const blocked = useIsBlocked("payment");

  useEffect(
    () => () => {
      active.current?.abort();
    },
    []
  );

  const pay = async (): Promise<void> => {
    if (active.current !== null) {
      return;
    }

    const controller = new AbortController();

    active.current = controller;

    try {
      await run(async () => {
        const response = await fetch("/api/payment", {
          method: "POST",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Payment failed");
        }
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error(error);
      }
    } finally {
      if (active.current === controller) {
        active.current = null;
      }
    }
  };

  return (
    <>
      <button disabled={blocked} onClick={pay}>
        Pay
      </button>
      <button onClick={() => active.current?.abort()}>Cancel payment</button>
    </>
  );
}
```

Scheduling and confirmation are described below. [Lifecycle observation and analytics](#middleware-system)
are optional diagnostics rather than prerequisites for this workflow.

#### Advanced hooks

These hooks are useful, but they are not the main onboarding path for most apps:

- `useConfirmableBlocker` for confirmation flows
- `useScheduledBlocker` for time-window blocking
- `useConditionalBlocker` for polling-based conditional synchronization

#### `useConfirmableBlocker(blockerId, config)`

Creates a confirmable action with UI blocking while the dialog is open or the action is running.
Use it for advanced confirmation flows after the core hooks are already a good fit.

Each hook instance runs at most one confirmation action at a time. Repeated `onConfirm()`
calls while it is running await the same outcome, including rejection; promise object identity
is not guaranteed. `execute()` and `onCancel()` do nothing during execution, including skipping
the cancellation callback. After success or failure, a new confirmation can run. Separate
instances remain independent and should use unique blocker IDs.

The dialog and running action keep the mounted hook's blocker active. Existing timeout and
unmount cleanup still apply: either can release the blocker without cancelling the action.
This hook does not provide operation cancellation or exclusion across instances.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: ConfirmableBlockerConfig` - Configuration object
  - `confirmMessage: string` - Message to show in confirmation dialog
  - `confirmTitle?: string` - Dialog title (default: "Confirm Action")
  - `confirmButtonText?: string` - Confirm button label (default: "Confirm")
  - `cancelButtonText?: string` - Cancel button label (default: "Cancel")
  - `onConfirm: () => void | Promise<void>` - Callback when user confirms
  - `onCancel?: () => void` - Callback when user cancels
  - Plus all `BlockerConfig` properties (scope, reason, priority, timeout)

**Returns:**

- `execute: () => void` - Opens the confirmation dialog
- `isDialogOpen: boolean` - Whether the dialog is open
- `isExecuting: boolean` - Whether the confirm action is running
- `confirmConfig: { title, message, confirmText, cancelText }` - UI-ready dialog config
- `onConfirm: () => Promise<void>` - Confirm handler to wire to your dialog
- `onCancel: () => void` - Cancel handler to wire to your dialog

**Example:**

```jsx
function UnsavedChangesGuard({ discardChanges }) {
  const { execute, isDialogOpen, isExecuting, confirmConfig, onConfirm, onCancel } =
    useConfirmableBlocker("unsaved-changes", {
      scope: "navigation",
      reason: "Unsaved changes",
      confirmMessage: "You have unsaved changes. Are you sure you want to leave?",
      onConfirm: async () => {
        await discardChanges();
      },
    });

  return (
    <>
      <button onClick={execute}>Leave</button>
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
      {isExecuting && <LoadingOverlay message="Processing..." />}
    </>
  );
}
```

#### `useScheduledBlocker(blockerId, config)`

Blocks UI during a scheduled time period or maintenance window.
Use it when blocking is driven by time windows rather than user-triggered async work.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: ScheduledBlockerConfig`
  - `schedule: BlockingSchedule`
    - `start: string | Date | number` - Start time (ISO string, Date, or timestamp)
    - `end?: string | Date | number` - End time (optional)
    - `duration?: number` - Duration in milliseconds (takes precedence over end)
  - `onScheduleStart?: () => void` - Callback when blocking starts
  - `onScheduleEnd?: () => void` - Callback when blocking ends
  - Plus all `BlockerConfig` properties (scope, reason, priority)

Changing `schedule.start`, `schedule.end`, or `schedule.duration` on rerender cancels the previous
timers and schedules the blocker using the latest values.

**Example:**

```jsx
function MaintenanceWindow() {
  useScheduledBlocker("maintenance", {
    scope: "global",
    reason: "Scheduled maintenance",
    priority: 1000,
    schedule: {
      start: "2024-01-15T02:00:00Z",
      duration: 3600000, // 1 hour in milliseconds
    },
    onScheduleStart: () => {
      console.log("Maintenance started");
    },
    onScheduleEnd: () => {
      console.log("Maintenance completed");
    },
  });

  return <div>App content</div>;
}
```

#### `useConditionalBlocker(blockerId, config)`

Periodically checks a condition and blocks/unblocks based on the result.
Use this when polling is an acceptable tradeoff and the condition is not naturally event-driven.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: ConditionalBlockerConfig<TState>`
  - `scope: string | string[]` - Required scope(s) to block
  - `condition: (state?: TState) => boolean` - Function that determines if blocking should be active
  - `checkInterval?: number` - How often to check the condition in ms (default: 1000; non-positive values use the default)
  - `state?: TState` - Optional state to pass to the condition function
  - Plus all other `BlockerConfig` properties, including reason, priority, timeout and onTimeout

Changing `checkInterval` on rerender restarts condition checks using the latest interval.

**Example:**

```jsx
function NetworkStatusBlocker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useConditionalBlocker("network-check", {
    scope: ["form", "navigation"],
    reason: "No network connection",
    priority: 100,
    condition: () => !isOnline,
    checkInterval: 2000,
  });

  return <div>App content</div>;
}
```

### Provider (Optional)

#### `UIBlockingProvider`

Provides an isolated store instance for SSR, testing, or micro-frontends. Without the provider, hooks use a global store.

**Props:**

- `children: ReactNode` - Child components
- `middlewares?: Middleware[]` - Initial middlewares to register

**Example:**

```jsx
import { UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";

// SSR - each request gets isolated state
function App() {
  return (
    <UIBlockingProvider>
      <MyApp />
    </UIBlockingProvider>
  );
}

// Testing - isolated state per test, no cleanup needed
function renderWithProvider(ui) {
  return render(<UIBlockingProvider>{ui}</UIBlockingProvider>);
}

// Micro-frontends - each app has its own blocking state
function MicroFrontend() {
  return (
    <UIBlockingProvider>
      <MicroApp />
    </UIBlockingProvider>
  );
}
```

#### Context Hooks

- `useUIBlockingContext()` - Get store API from context (throws if outside provider)
- `useOptionalUIBlockingContext()` - Get store API from context or `null` outside provider
- `useIsInsideUIBlockingProvider()` - Check if inside a provider
- `useUIBlockingStoreFromContext(selector)` - Select state from context store
- `useResolvedStoreApi()` - Resolve to provider store API or global store API
- `useResolvedValue(selector)` - Resolve to provider/global store and select with shallow comparison

Legacy aliases remain available for backward compatibility:

- `useOptionalContext()` -> `useOptionalUIBlockingContext()`
- `useResolvedStore()` -> `useResolvedStoreApi()`
- `useResolvedStoreWithSelector()` -> `useResolvedValue()`

### Store

#### `useUIBlockingStore`

Direct access to the Zustand store for advanced use cases (requires a selector).

**Methods:**

- `addBlocker(id, config)` - Manually add a blocker (re-adding with the same ID replaces config)
- `updateBlocker(id, config)` - Update blocker metadata (timeout restarts if new `timeout` value provided)
- `removeBlocker(id)` - Manually remove a blocker
- `isBlocked(scope)` - Check if scope is blocked
- `getBlockingInfo(scope)` - Get detailed blocking information
- `clearAllBlockers()` - Remove all blockers (emits `"clear"` middleware event)
- `clearBlockersForScope(scope)` - Remove blockers for specific scope (emits `"clear_scope"` middleware event)
- `observeBlockingEvents(observer)` - Observe lifecycle events; returns an ownership-safe, idempotent release function.

**Note about `updateBlocker` and timeouts:**

- If you pass a **new** `timeout` value, the timer will be **restarted**
- If you **don't** pass `timeout`, the existing timer continues unchanged
- Set `timeout: 0` to **clear** an existing timeout
- `addBlocker` always resets/creates a new timeout timer when called with the same ID

**Example:**

```jsx
import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";

function AdvancedComponent() {
  const { addBlocker, updateBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    updateBlocker: state.updateBlocker,
    removeBlocker: state.removeBlocker,
  }));

  const startBlocking = () => {
    addBlocker("custom-blocker", {
      scope: ["form", "navigation"],
      reason: "Critical operation in progress",
      priority: 100,
    });
  };

  const updatePriority = () => {
    // Update metadata - timeout continues if not changed
    updateBlocker("custom-blocker", { priority: 200 });
  };

  const extendTimeout = () => {
    // Update timeout - timer restarts with new value
    updateBlocker("custom-blocker", { timeout: 60000 });
  };

  const stopBlocking = () => {
    removeBlocker("custom-blocker");
  };

  return (
    <div>
      <button onClick={startBlocking}>Start</button>
      <button onClick={updatePriority}>Increase Priority</button>
      <button onClick={stopBlocking}>Stop</button>
    </div>
  );
}
```

For non-hook contexts (tests, utilities, event handlers), use `uiBlockingStoreApi`:

```jsx
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";

const { addBlocker } = uiBlockingStoreApi.getState();
addBlocker("server-call", {
  scope: "global",
  reason: "Server call running",
});
```

## Middleware System

Middleware is optional. Use it when you need analytics, logging, or performance visibility around blocker lifecycle events.

Most applications can start without middleware and add it later if blocker observability becomes important.

### Middleware Actions

Middleware receives events for the following actions:

- `"add"` - Blocker was added
- `"update"` - Blocker metadata was updated
- `"remove"` - Blocker was removed
- `"timeout"` - Blocker was auto-removed due to timeout
- `"clear"` - All blockers were cleared (includes `count` field)
- `"clear_scope"` - Blockers for specific scope were cleared (includes `scope` and `count` fields)

**MiddlewareContext type:**

```typescript
{
  action: "add" | "update" | "remove" | "timeout" | "clear" | "clear_scope";
  blockerId: string;
  config?: BlockerConfig;
  timestamp: number;
  prevState?: BlockerConfig;  // Available for "update" and "remove"
  scope?: string;             // Available for "clear_scope"
  count?: number;             // Available for "clear" and "clear_scope"
}
```

### Lifecycle notification order

Lifecycle actions update the current state immediately. `getSnapshot()` and `isBlocked()` therefore
read the latest state even while an earlier snapshot is being delivered. Snapshot subscribers receive
immutable snapshots in transition order. For a transition with an event, all snapshot subscribers are
called before its observers; that event reaches every observer before notifications from actions started
by those callbacks. Reentrant notifications are queued and drained synchronously.

The Zustand adapter publishes `blockingSnapshot`, a readonly array of frozen `BlockerInfo`
projections. It retains `@okyrychenko-dev/react-zustand-toolkit` for both global and provider-scoped
React state. Use lifecycle actions to change blockers; external `setState` writes cannot replace the
lifecycle projection. Each store adapts one independent lifecycle.

Observation is anonymous and additive. A throwing subscriber or observer does not interrupt
transitions or later listeners. Observers run in registration order without awaiting asynchronous
completion. Each `observeBlockingEvents()` call owns only its own registration and returns an
idempotent release function. A throwing timeout callback cannot prevent the separate, ordered
`timeout` and `remove` events. Replacing a blocker invalidates its previous timer.

Scope normalization is shared with guarded controls: omitted scopes resolve to `global` and empty lists match nothing,
arrays are deduplicated and sorted, and global blockers affect every ordinary scope observation.
Targeted clearing does not treat global as a wildcard and preserves global blockers.

See [architecture migration](./migration) for removed compatibility interfaces.

### Built-in Middleware

These are extensions around the blocker lifecycle, not the primary onboarding path for the library.

#### Analytics Middleware

Track blocker events with your analytics provider (Google Analytics, Mixpanel, Amplitude, or custom).

```jsx
import {
  configureMiddleware,
  createAnalyticsMiddleware,
} from "@okyrychenko-dev/react-action-guard";

// Google Analytics
configureMiddleware([createAnalyticsMiddleware({ provider: "ga" })]);

// Mixpanel
configureMiddleware([createAnalyticsMiddleware({ provider: "mixpanel" })]);

// Amplitude
configureMiddleware([createAnalyticsMiddleware({ provider: "amplitude" })]);

// Custom analytics
configureMiddleware([
  createAnalyticsMiddleware({
    track: (event, data) => {
      myAnalytics.track(event, data);
    },
  }),
]);
```

#### Logger Middleware

Log blocker lifecycle events to the console for debugging.
The middleware is not disabled automatically in production; register it conditionally when needed.

```jsx
import { configureMiddleware, loggerMiddleware } from "@okyrychenko-dev/react-action-guard";

configureMiddleware([loggerMiddleware]);
```

#### Performance Middleware

Monitor blocker performance and detect slow operations.

```jsx
import {
  configureMiddleware,
  createPerformanceMiddleware,
} from "@okyrychenko-dev/react-action-guard";

configureMiddleware([
  createPerformanceMiddleware({
    onSlowBlock: (blockerId, duration) => {
      console.warn(`Blocker ${blockerId} was active for ${duration}ms`);
    },
    slowBlockThreshold: 5000, // 5 seconds
  }),
]);
```

Note: `configureMiddleware` registers middleware on the global store. If you use `UIBlockingProvider`, register middleware via the provider's `middlewares` prop instead.
Each `configureMiddleware(...)` call releases only its previous configured observations. Independent observations and provider-level middleware remain active.

Analytics middleware is SSR-safe: in non-browser environments it becomes a no-op for `ga`, `mixpanel`, and `amplitude` providers.

### Custom Middleware

Create your own middleware to handle blocker events:

```jsx
import { configureMiddleware } from "@okyrychenko-dev/react-action-guard";

const myCustomMiddleware = (context) => {
  const { action, blockerId, config, timestamp, scope, count } = context;

  if (action === "add") {
    console.log(`Blocker added: ${blockerId}`, config);
  } else if (action === "update") {
    console.log(`Blocker updated: ${blockerId}`, config);
  } else if (action === "remove") {
    console.log(`Blocker removed: ${blockerId}`);
  } else if (action === "timeout") {
    console.log(`Blocker timed out: ${blockerId}`);
  } else if (action === "clear") {
    console.log(`All blockers cleared (${count} total)`);
  } else if (action === "clear_scope") {
    console.log(`Cleared ${count} blocker(s) for scope: ${scope}`);
  }
};

configureMiddleware([myCustomMiddleware]);
```

### Combining Middleware

You can combine multiple middleware when you need broader observability:

```jsx
import {
  configureMiddleware,
  createAnalyticsMiddleware,
  loggerMiddleware,
  createPerformanceMiddleware,
} from "@okyrychenko-dev/react-action-guard";

configureMiddleware([
  loggerMiddleware,
  createAnalyticsMiddleware({ provider: "ga" }),
  createPerformanceMiddleware({
    slowBlockThreshold: 3000,
    onSlowBlock: (blockerId, duration) => {
      // Send to error tracking service
      errorTracker.captureMessage(`Slow blocker: ${blockerId}`, {
        duration,
      });
    },
  }),
]);
```

## Tree Shaking

The library is fully tree-shakeable. Import only the features you need to keep your bundle size small:

```jsx
// Only imports the hook you need
import { useActionBlocker } from "@okyrychenko-dev/react-action-guard";

// Middleware is not included unless you import it
import {
  configureMiddleware,
  createAnalyticsMiddleware,
} from "@okyrychenko-dev/react-action-guard";
```

The package is configured with `"sideEffects": false`, allowing modern bundlers (Webpack, Rollup, Vite) to eliminate unused code automatically.

## TypeScript

The package is written in TypeScript and includes full type definitions.

```typescript
import type {
  // Core types
  BlockerConfig,
  BlockerInfo,
  UIBlockingStore,
  UIBlockingStoreState,

  // Hook types
  ConfirmableBlockerConfig,
  ConfirmDialogConfig,
  UseConfirmableBlockerReturn,
  ScheduledBlockerConfig,
  ConditionalBlockerConfig,
  BlockingSchedule,
  UseAsyncActionOptions,

  // Middleware types
  Middleware,
  MiddlewareContext,
  AnalyticsConfig,
  AnalyticsProvider,
  PerformanceConfig,

  // Type-safe scopes
  BlockerConfigTyped,
  DefaultScopes,
  ScopeValue,
} from "@okyrychenko-dev/react-action-guard";
```

## Type-Safe Scopes

Create typed versions of the hooks to prevent scope typos at compile time:

```typescript
import { createTypedHooks } from "@okyrychenko-dev/react-action-guard";

type AppScopes = "global" | "form" | "navigation" | "checkout";

const { useActionBlocker, useIsBlocked, useAsyncAction, useBlockingInfo } =
  createTypedHooks<AppScopes>();

useActionBlocker("save", { scope: "form" }); // OK
useActionBlocker("save", { scope: "typo" }); // Type error
```

## Use Cases

The first four examples below are the most representative starting points.

### Loading States

```jsx
function DataLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useActionBlocker(
    "data-loader",
    {
      scope: "content",
      reason: "Loading data",
    },
    isLoading
  );

  // ... rest of component
}
```

### Form Submission with Analytics

```jsx
import { useAsyncAction, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function UserForm() {
  const executeWithBlocking = useAsyncAction("submit-form", "form");
  const isBlocked = useIsBlocked("form");

  const handleSubmit = async (data) => {
    await executeWithBlocking(async () => {
      await submitForm(data);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input disabled={isBlocked} />
      <button disabled={isBlocked}>Submit</button>
    </form>
  );
}
```

### Advanced: Unsaved Changes Protection

```jsx
import { useConfirmableBlocker } from "@okyrychenko-dev/react-action-guard";

function FormWithUnsavedWarning() {
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { execute, isDialogOpen, confirmConfig, onConfirm, onCancel } = useConfirmableBlocker(
    "unsaved-form",
    {
      scope: "navigation",
      reason: "Unsaved form data",
      priority: 100,
      confirmMessage: "You have unsaved changes. Discard them?",
      onConfirm: () => {
        setFormData({});
        setHasChanges(false);
      },
    }
  );

  return (
    <form>
      <input
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          setHasChanges(true);
        }}
      />
      <button type="button" onClick={execute}>
        Cancel
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
    </form>
  );
}
```

### Global Loading Overlay

```jsx
function App() {
  const isGloballyBlocked = useIsBlocked("global");

  return (
    <div>
      {isGloballyBlocked && <LoadingOverlay />}
      <YourApp />
    </div>
  );
}
```

### Multi-Step Process with Priority

```jsx
function MultiStepWizard() {
  const [step, setStep] = useState(1);

  // Higher priority for payment step
  useActionBlocker(
    "payment-step",
    {
      scope: ["navigation", "form"],
      reason: "Processing payment",
      priority: 100,
    },
    step === 3
  );

  // Lower priority for other steps
  useActionBlocker(
    "wizard-step",
    {
      scope: "navigation",
      reason: "Wizard in progress",
      priority: 50,
    },
    step < 3
  );

  return <div>Step {step}</div>;
}
```

### Advanced: Scheduled Maintenance Window

```jsx
import { useScheduledBlocker } from "@okyrychenko-dev/react-action-guard";

function App() {
  useScheduledBlocker("weekly-maintenance", {
    scope: "global",
    reason: "Weekly system maintenance",
    priority: 500,
    schedule: {
      start: new Date("2024-01-21T03:00:00Z"),
      duration: 1800000, // 30 minutes
    },
    onScheduleStart: () => {
      showNotification("System maintenance in progress");
    },
    onScheduleEnd: () => {
      showNotification("Maintenance completed");
      window.location.reload();
    },
  });

  return <YourApp />;
}
```

### Advanced: Dynamic Blocking Based on State

```jsx
import { useConditionalBlocker } from "@okyrychenko-dev/react-action-guard";

function StorageQuotaGuard() {
  const [storageUsed, setStorageUsed] = useState(0);
  const STORAGE_LIMIT = 1000000; // 1MB

  useConditionalBlocker("storage-limit", {
    scope: ["upload", "save"],
    reason: "Storage quota exceeded",
    priority: 200,
    condition: () => storageUsed > STORAGE_LIMIT,
    state: storageUsed,
    checkInterval: 5000, // Check every 5 seconds
  });

  return (
    <div>
      <p>
        Storage used: {storageUsed} / {STORAGE_LIMIT} bytes
      </p>
      <UploadButton />
    </div>
  );
}
```

### Clearing Blockers on Navigation

Clear blockers when navigating away or on specific events:

```jsx
import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import { useEffect } from "react";

function CheckoutPage() {
  const { clearBlockersForScope, clearAllBlockers } = useUIBlockingStore((state) => ({
    clearBlockersForScope: state.clearBlockersForScope,
    clearAllBlockers: state.clearAllBlockers,
  }));

  // Clear checkout-specific blockers when leaving the page
  useEffect(() => {
    return () => {
      // Clean up checkout blockers on unmount
      clearBlockersForScope("checkout");
    };
  }, [clearBlockersForScope]);

  const handleCancelOrder = () => {
    // Clear all blockers when user explicitly cancels
    clearAllBlockers();
    navigate("/");
  };

  return (
    <div>
      <CheckoutForm />
      <button onClick={handleCancelOrder}>Cancel Order</button>
    </div>
  );
}
```

### Managing Session Timeouts with Dynamic Updates

Extend or update blocker timeouts dynamically:

```jsx
import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";

function SessionManager() {
  const { addBlocker, updateBlocker, removeBlocker } = useUIBlockingStore((state) => ({
    addBlocker: state.addBlocker,
    updateBlocker: state.updateBlocker,
    removeBlocker: state.removeBlocker,
  }));

  const startSession = () => {
    addBlocker("session-timeout", {
      scope: "global",
      reason: "Session expiring soon",
      priority: 50,
      timeout: 300000, // 5 minutes
      onTimeout: () => {
        logout();
        showNotification("Session expired");
      },
    });
  };

  const extendSession = () => {
    // Extend timeout - timer restarts with new value
    updateBlocker("session-timeout", {
      timeout: 600000, // 10 minutes
      reason: "Session extended",
    });
  };

  const endSession = () => {
    removeBlocker("session-timeout");
    logout();
  };

  return (
    <div>
      <button onClick={startSession}>Start Session</button>
      <button onClick={extendSession}>Extend Session</button>
      <button onClick={endSession}>Logout</button>
    </div>
  );
}
```
