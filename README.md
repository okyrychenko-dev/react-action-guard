# @okyrychenko-dev/react-action-guard

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Elegant UI blocking management for React applications with priorities, scopes, and automatic cleanup

## Features

- Priority-based blocking system
- Scoped blocking (global, specific areas, or multiple scopes)
- Automatic cleanup on unmount
- Advanced hooks for different use cases:
  - Confirmable blockers with custom dialogs
  - Scheduled blocking for maintenance windows
  - Conditional blocking based on application state
  - Async action wrapping
- Advanced middleware system for analytics, logging, and performance monitoring
- TypeScript support with full type safety
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

- [React](https://react.dev/) ^17.0.0 || ^18.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) - State management library

## Quick Start

```jsx
import { useBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function MyComponent() {
  const isBlocked = useIsBlocked("my-scope");

  return <button disabled={isBlocked}>Click me</button>;
}
```

## Documentation

📚 **[Interactive Storybook Documentation](https://your-storybook-url.com)** - Explore live examples and detailed guides for all hooks

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
- `reason?: string` - Reason for blocking
- `priority: number` - Priority level (0-100)
- `scope: string | string[]` - Scope(s) being blocked
- `timestamp: number` - When the blocker was added

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

#### `useAsyncAction(actionId, scope)`

Wraps an async function with automatic blocking/unblocking.

**Parameters:**

- `actionId: string` - Identifier for the action
- `scope?: string | string[]` - Scope(s) to block during execution

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
```

#### `useConfirmableBlocker(blockerId, config, options)`

Creates a blocker that requires user confirmation before being removed.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: BlockerConfig` - Configuration object
- `options: ConfirmableBlockerOptions`
  - `enabled?: boolean` - Whether the blocker is active (default: true)
  - `confirmMessage?: string` - Message to show in confirmation dialog
  - `onConfirm?: () => void | Promise<void>` - Callback when user confirms

**Returns:**

- `isBlocking: boolean` - Whether the blocker is currently active
- `cancel: () => void` - Manually remove the blocker without confirmation
- `requestRemoval: () => Promise<boolean>` - Request removal with confirmation

**Example:**

```jsx
function UnsavedChangesGuard() {
  const { isBlocking, requestRemoval } = useConfirmableBlocker(
    "unsaved-changes",
    {
      scope: "navigation",
      reason: "Unsaved changes",
    },
    {
      enabled: hasUnsavedChanges,
      confirmMessage: "You have unsaved changes. Are you sure you want to leave?",
      onConfirm: async () => {
        await discardChanges();
      },
    }
  );

  return (
    <div>
      {isBlocking && <UnsavedIndicator />}
      <button onClick={requestRemoval}>Leave</button>
    </div>
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

### Store

#### `useUIBlockingStore`

Direct access to the Zustand store for advanced use cases.

**Methods:**

- `addBlocker(id, config)` - Manually add a blocker
- `removeBlocker(id)` - Manually remove a blocker
- `updateBlocker(id, config)` - Update an existing blocker
- `isBlocked(scope)` - Check if scope is blocked
- `getBlockingInfo(scope)` - Get detailed blocking information
- `clearAllBlockers()` - Remove all blockers
- `clearBlockersForScope(scope)` - Remove blockers for specific scope

**Example:**

```jsx
import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";

function AdvancedComponent() {
  const { addBlocker, removeBlocker, updateBlocker } = useUIBlockingStore();

  const startBlocking = () => {
    addBlocker("custom-blocker", {
      scope: ["form", "navigation"],
      reason: "Critical operation in progress",
      priority: 100,
    });
  };

  const updatePriority = () => {
    updateBlocker("custom-blocker", {
      priority: 200,
    });
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

## Middleware System

The library includes a powerful middleware system that allows you to hook into blocker lifecycle events for analytics, logging, and performance monitoring.

### Built-in Middleware

#### Analytics Middleware

Track blocker events with your analytics provider (Google Analytics, Mixpanel, Amplitude, or custom).

```jsx
import { configureMiddleware, createAnalyticsMiddleware } from "@okyrychenko-dev/react-action-guard";

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
import { configureMiddleware, createPerformanceMiddleware } from "@okyrychenko-dev/react-action-guard";

configureMiddleware([
  createPerformanceMiddleware({
    onSlowBlock: (blockerId, duration) => {
      console.warn(`Blocker ${blockerId} was active for ${duration}ms`);
    },
    slowBlockThreshold: 5000, // 5 seconds
  }),
]);
```

### Custom Middleware

Create your own middleware to handle blocker events:

```jsx
import { configureMiddleware } from "@okyrychenko-dev/react-action-guard";

const myCustomMiddleware = (context) => {
  const { action, blockerId, config, timestamp } = context;

  if (action === "add") {
    console.log(`Blocker added: ${blockerId}`, config);
  } else if (action === "remove") {
    console.log(`Blocker removed: ${blockerId}`);
  } else if (action === "update") {
    console.log(`Blocker updated: ${blockerId}`, config);
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
import { configureMiddleware, createAnalyticsMiddleware } from "@okyrychenko-dev/react-action-guard";
```

The package is configured with `"sideEffects": false`, allowing modern bundlers (Webpack, Rollup, Vite) to eliminate unused code automatically.

## TypeScript

The package is written in TypeScript and includes full type definitions.

```typescript
import type {
  // Core types
  BlockerConfig,
  BlockerInfo,
  UIBlockingState,

  // Hook types
  ConfirmableBlockerOptions,
  ScheduledBlockerConfig,
  ConditionalBlockerConfig,
  BlockingSchedule,

  // Middleware types
  Middleware,
  MiddlewareContext,
  AnalyticsConfig,
  AnalyticsProvider,
  PerformanceMiddlewareConfig,
} from "@okyrychenko-dev/react-action-guard";
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

  const { requestRemoval } = useConfirmableBlocker(
    "unsaved-form",
    {
      scope: "navigation",
      reason: "Unsaved form data",
      priority: 100,
    },
    {
      enabled: hasChanges,
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
      <button onClick={requestRemoval}>Cancel</button>
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

MIT © Olexii Kyrychenko
