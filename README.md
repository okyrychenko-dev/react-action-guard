# @okyrychenko-dev/react-action-guard

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Elegant UI blocking management for React applications with priorities, scopes, and automatic cleanup

## Features

- Priority-based blocking system
- Scoped blocking (global, specific areas, or multiple scopes)
- Automatic cleanup on unmount
- **Timeout mechanism** - auto-remove blockers after specified time
- **Provider pattern** - isolated stores for SSR, testing, and micro-frontends
- Advanced hooks for different use cases:
  - Confirmable blockers with custom dialogs
  - Scheduled blocking for maintenance windows
  - Conditional blocking based on application state
  - Async action wrapping with timeout support
- Advanced middleware system for analytics, logging, and performance monitoring
- TypeScript support with full type safety (including optional type-safe scopes)
- Built on Zustand for efficient state management
- Tree-shakeable - import only what you need
- Hooks-based API

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard zustand
# or
yarn add @okyrychenko-dev/react-action-guard zustand
# or
pnpm add @okyrychenko-dev/react-action-guard zustand
```

This package requires the following peer dependencies:

- [React](https://react.dev/) ^17.0.0 || ^18.0.0 || ^19.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) ^4.5.7 || ^5.0.0 - State management library

## Quick Start

```jsx
import { useBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function MyComponent() {
  const isBlocked = useIsBlocked("my-scope");

  return <button disabled={isBlocked}>Click me</button>;
}
```

## Documentation

📚 **Interactive Storybook Documentation** - Run locally to explore live examples and detailed guides for all hooks

To run Storybook locally:

```bash
npm run storybook
```

## API Reference

### Hooks

#### `useBlocker(blockerId, config, isActive)`

Automatically adds a blocker when the component mounts and removes it on unmount.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: BlockerConfig` - Configuration object
  - `scope?: string | string[]` - Scope(s) to block (default: "global")
  - `reason?: string` - Reason for blocking (for debugging)
  - `priority?: number` - Priority level (higher = more important)
  - `timeout?: number` - Auto-remove after N milliseconds
  - `onTimeout?: (blockerId: string) => void` - Callback when auto-removed
- `isActive?: boolean` - Whether the blocker is active (default: true)

**Example:**

```jsx
function MyComponent() {
  useBlocker("my-blocker", {
    scope: "form",
    reason: "Form is saving",
    priority: 10,
  });

  return <div>Content</div>;
}

// With timeout - auto-removes after 30 seconds
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  useBlocker("save-operation", {
    scope: "form",
    reason: "Saving...",
    timeout: 30000,
    onTimeout: (id) => {
      console.warn(`Operation ${id} timed out`);
      showNotification("Operation timed out");
      setIsSaving(false);
    },
  }, isSaving);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveData();
    } finally {
      setIsSaving(false);
    }
  };

  return <button onClick={handleSave} disabled={isSaving}>Save</button>;
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

Gets detailed information about all active blockers for a specific scope.

**Parameters:**

- `scope?: string` - Scope to get blocking information for (default: "global")

**Returns:** `ReadonlyArray<BlockerInfo>` - Array of blocker information objects, sorted by priority (highest first)

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
  - `onTimeout?: (blockerId: string) => void` - Callback when timed out

**Returns:** `(asyncFn: () => Promise<T>) => Promise<T>` - Function wrapper

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

// With timeout - prevents infinite blocking if operation hangs
function ApiComponent() {
  const execute = useAsyncAction("api-call", "global", {
    timeout: 60000, // 1 minute timeout
    onTimeout: (id) => {
      showError("Request timed out. Please try again.");
    },
  });

  const fetchData = () => execute(async () => {
    const response = await fetch("/api/data");
    return response.json();
  });

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

#### `useConfirmableBlocker(blockerId, config)`

Creates a confirmable action with UI blocking while the dialog is open or the action is running.

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
  const {
    execute,
    isDialogOpen,
    isExecuting,
    confirmConfig,
    onConfirm,
    onCancel,
  } = useConfirmableBlocker("unsaved-changes", {
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

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: ConditionalBlockerConfig<TState>`
  - `scope: string | string[]` - Required scope(s) to block
  - `condition: (state?: TState) => boolean` - Function that determines if blocking should be active
  - `checkInterval?: number` - How often to check the condition in ms (default: 1000)
  - `state?: TState` - Optional state to pass to the condition function
  - Plus all other `BlockerConfig` properties (reason, priority)

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
- `enableDevtools?: boolean` - Enable Redux DevTools (default: true in development)
- `devtoolsName?: string` - Name for DevTools (default: "UIBlocking")
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
  return render(
    <UIBlockingProvider>{ui}</UIBlockingProvider>
  );
}

// Micro-frontends - each app has its own blocking state
function MicroFrontend() {
  return (
    <UIBlockingProvider devtoolsName="MicroApp-Blocking">
      <MicroApp />
    </UIBlockingProvider>
  );
}
```

#### Context Hooks

- `useUIBlockingContext()` - Get store from context (throws if outside provider)
- `useIsInsideUIBlockingProvider()` - Check if inside a provider
- `useUIBlockingStoreFromContext(selector)` - Select state from context store

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
- `registerMiddleware(name, middleware)` - Register middleware manually
- `unregisterMiddleware(name)` - Unregister middleware manually

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

uiBlockingStoreApi.getState().addBlocker("server-call", {
  scope: "global",
  reason: "Server call running",
});
```

### Store Toolkit Helpers

Advanced store helpers are re-exported from the internal toolkit for custom setups:

- `createShallowStore`
- `createStoreToolkit`
- `createStoreProvider`
- `createResolvedStoreHooks`

## Middleware System

The library includes a powerful middleware system that allows you to hook into blocker lifecycle events for analytics, logging, and performance monitoring.

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

### Built-in Middleware

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

You can combine multiple middleware for comprehensive monitoring:

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
import { useBlocker } from "@okyrychenko-dev/react-action-guard";

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

const { useBlocker, useIsBlocked, useAsyncAction, useBlockingInfo } =
  createTypedHooks<AppScopes>();

useBlocker("save", { scope: "form" }); // OK
useBlocker("save", { scope: "typo" }); // Type error
```

## Use Cases

### Loading States

```jsx
function DataLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useBlocker(
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

### Unsaved Changes Protection

```jsx
import { useConfirmableBlocker } from "@okyrychenko-dev/react-action-guard";

function FormWithUnsavedWarning() {
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const {
    execute,
    isDialogOpen,
    confirmConfig,
    onConfirm,
    onCancel,
  } = useConfirmableBlocker("unsaved-form", {
    scope: "navigation",
    reason: "Unsaved form data",
    priority: 100,
    confirmMessage: "You have unsaved changes. Discard them?",
    onConfirm: () => {
      setFormData({});
      setHasChanges(false);
    },
  });

  return (
    <form>
      <input
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          setHasChanges(true);
        }}
      />
      <button type="button" onClick={execute}>Cancel</button>
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
  useBlocker(
    "payment-step",
    {
      scope: ["navigation", "form"],
      reason: "Processing payment",
      priority: 100,
    },
    step === 3
  );

  // Lower priority for other steps
  useBlocker(
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

### Scheduled Maintenance Window

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

### Dynamic Blocking Based on State

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
  const { clearBlockersForScope, clearAllBlockers } = useUIBlockingStore(
    (state) => ({
      clearBlockersForScope: state.clearBlockersForScope,
      clearAllBlockers: state.clearAllBlockers,
    })
  );

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
  const { addBlocker, updateBlocker, removeBlocker } = useUIBlockingStore(
    (state) => ({
      addBlocker: state.addBlocker,
      updateBlocker: state.updateBlocker,
      removeBlocker: state.removeBlocker,
    })
  );

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

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm run test`)
2. Code is properly typed (`npm run typecheck`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT © Oleksii Kyrychenko
