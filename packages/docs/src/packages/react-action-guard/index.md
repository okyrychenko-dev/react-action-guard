# React Action Guard

> Elegant UI blocking management for React applications with priorities, scopes, and automatic cleanup

## What isReact Action Guard?

React Action Guard is a comprehensive solution for managing UI blocking states in React applications. It provides a declarative, priority-based system for coordinating when and how your UI should be blocked during async operations.

## Key Features

### 🎯 Priority-Based Blocking

Manage multiple concurrent blockers with configurable priorities. Priority orders reasons; every matching active blocker retains protection, including lower-priority ones.

### 🔒 Scoped Blocking

Block specific areas of your UI rather than everything. Use named scopes like `'form'`, `'navigation'`, or `'checkout'`, or block multiple scopes simultaneously.

### ⏱️ Timeout Mechanism

Prevent infinite blocking with automatic timeouts. Blockers can be configured to auto-remove after a specified duration with optional callbacks.

### 🧹 Automatic Cleanup

No manual cleanup needed. Blockers are automatically removed when components unmount, preventing memory leaks.

### 🏗️ Provider Pattern

Create isolated store instances for SSR, testing, and micro-frontends. Each provider maintains independent blocking state.

### 🔌 Middleware System

Powerful middleware for analytics, logging, and performance monitoring with built-in integrations for Google Analytics, Mixpanel, and Amplitude.

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

**Peer Dependencies:**

- React: ^17.0.0 || ^18.0.0 || ^19.0.0
- Zustand: ^4.5.7 || ^5.0.0

## Quick Start

```tsx
import { useState } from "react";
import {
  UIBlockingProvider,
  useActionBlocker,
  useIsBlocked,
} from "@okyrychenko-dev/react-action-guard";

function SaveButton({ saveData }: { saveData: () => Promise<void> }) {
  const [isSaving, setIsSaving] = useState(false);
  useActionBlocker(
    "save-operation",
    {
      scope: "form",
      reason: "Saving data...",
    },
    isSaving
  );
  const isBlocked = useIsBlocked("form");

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveData();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button disabled={isBlocked} onClick={handleSave}>
      Save
    </button>
  );
}

export function App({ saveData }: { saveData: () => Promise<void> }) {
  return (
    <UIBlockingProvider>
      <SaveButton saveData={saveData} />
    </UIBlockingProvider>
  );
}
```

## Core Concepts

### Blockers

A blocker is a temporary state that indicates the UI should be blocked. Each blocker has:

- **ID**: Unique identifier
- **Scope**: What areas to block (`string | string[]`)
- **Priority**: Reason ordering (`number`, default: 0)
- **Reason**: Human-readable explanation
- **Timeout**: Optional auto-removal duration

```tsx
useActionBlocker(
  "blocker-id",
  {
    scope: ["form", "navigation"],
    priority: 50,
    reason: "Critical operation",
    timeout: 30000, // 30 seconds
    onTimeout: (id) => console.warn(`${id} timed out`),
  },
  isActive
);
```

### Scopes

Scopes define **what** gets blocked:

```tsx
// Block form only
useActionBlocker("save", { scope: "form" }, isSaving);

// Block multiple scopes
useActionBlocker("checkout", { scope: ["form", "navigation"] }, isCheckingOut);

// Block everything
useActionBlocker("critical", { scope: "global" }, isCritical);
```

Check if a scope is blocked:

```tsx
const isFormBlocked = useIsBlocked("form");
const isAnyBlocked = useIsBlocked(["form", "navigation"]); // true if ANY are blocked
```

### Priorities

When multiple blockers target the same scope, priority determines which one's reason is displayed:

```tsx
// Lower priority
useActionBlocker("bg-task", { scope: "global", priority: 5 }, isBgRunning);

// Higher priority - reason listed first
useActionBlocker("important", { scope: "global", priority: 100 }, isImportantRunning);
```

Get blocker information sorted by priority:

```tsx
const blockers = useBlockingInfo("global");
const topBlocker = blockers[0]; // Highest priority
console.log(topBlocker.reason);
```

## API Overview

### Hooks

- **[useActionBlocker](/packages/react-action-guard/api/hooks#useactionblocker)** - Automatically add/remove blocker
- **[useIsBlocked](/packages/react-action-guard/api/hooks#useisblocked)** - Check if scope is blocked
- **[useBlockingInfo](/packages/react-action-guard/api/hooks#useblockinginfo)** - Get detailed blocker information
- **[useAsyncAction](/packages/react-action-guard/api/hooks#useasyncaction)** - Wrap async function with blocking
- **[useConfirmableBlocker](/packages/react-action-guard/api/hooks#useconfirmableblocker)** - Block with confirmation dialog
- **[useScheduledBlocker](/packages/react-action-guard/api/hooks#usescheduledblocker)** - Block during time window
- **[useConditionalBlocker](/packages/react-action-guard/api/hooks#useconditionalBlocker)** - Block based on condition

### Components

- **[UIBlockingProvider](/packages/react-action-guard/guides/provider-pattern)** - Isolated store instance

### Store

- **[useUIBlockingStore](/packages/react-action-guard/api/store)** - Direct store access
- **[uiBlockingStoreApi](/packages/react-action-guard/api/store)** - Non-hook store access

### Middleware

- **[configureMiddleware](/packages/react-action-guard/api/middleware)** - Register middleware
- **[loggerMiddleware](/packages/react-action-guard/api/middleware#logger)** - Console logging
- **[createAnalyticsMiddleware](/packages/react-action-guard/api/middleware#analytics)** - Analytics tracking
- **[createPerformanceMiddleware](/packages/react-action-guard/api/middleware#performance)** - Performance monitoring

## Architecture

React Action Guard is built on [Zustand](https://zustand-demo.pmnd.rs/) for state management and uses [@okyrychenko-dev/react-zustand-toolkit](/packages/react-zustand-toolkit/) for enhanced store capabilities.

### Store Structure

```typescript
interface UIBlockingStore {
  // State
  readonly blockingSnapshot: ReadonlyArray<Readonly<BlockerInfo>>;

  // Actions
  addBlocker: (id: string, config: BlockerConfig) => void;
  removeBlocker: (id: string) => void;
  updateBlocker: (id: string, config: Partial<BlockerConfig>) => void;
  isBlocked: (scope?: string | string[]) => boolean;
  getBlockingInfo: (scope?: string) => BlockerInfo[];
  clearAllBlockers: () => void;
  clearBlockersForScope: (scope: string) => void;
  observeBlockingEvents: (observer: Middleware) => VoidFunction;
}
```

[Learn more about the architecture →](./architecture)

## Use Cases

### Form Blocking

```tsx
function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useActionBlocker(
    "form-submit",
    {
      scope: "form",
      reason: "Submitting...",
    },
    isSubmitting
  );

  const isBlocked = useIsBlocked("form");

  return (
    <form>
      <input disabled={isBlocked} />
      <button disabled={isBlocked} type="submit">
        Submit
      </button>
    </form>
  );
}
```

### Loading States

```tsx
function DataLoader() {
  const executeWithBlocking = useAsyncAction("load-data", "content");

  const loadData = () =>
    executeWithBlocking(async () => {
      const data = await fetchData();
      setData(data);
    });

  return <button onClick={loadData}>Load Data</button>;
}
```

### Unsaved Changes Protection

```tsx
function FormWithWarning() {
  const { execute, isDialogOpen, onConfirm, onCancel } = useConfirmableBlocker("unsaved-changes", {
    scope: "navigation",
    confirmMessage: "You have unsaved changes. Discard them?",
    onConfirm: () => navigate("/away"),
  });

  return (
    <>
      <form>{/* ... */}</form>
      <button onClick={execute}>Leave</button>
      {isDialogOpen && <ConfirmDialog onConfirm={onConfirm} onCancel={onCancel} />}
    </>
  );
}
```

## Documentation

- **[Getting Started](/getting-started)** - Quick introduction
- **[Architecture](./architecture)** - Deep dive into how it works
- **[API Reference](./api/hooks)** - Complete API documentation
- **[Guides](./guides/getting-started)** - Usage guides and patterns
- **[Examples](./examples/basic-usage)** - Real-world examples
- **[Internals](./internals/store-implementation)** - For contributors

## Related Packages

- **[@okyrychenko-dev/react-action-guard-devtools](/packages/react-action-guard-devtools/)** - DevTools for debugging
- **[@okyrychenko-dev/react-action-guard-tanstack](/packages/react-action-guard-tanstack/)** - TanStack Query integration
- **[@okyrychenko-dev/react-zustand-toolkit](/packages/react-zustand-toolkit/)** - Zustand toolkit (used internally)

## License

MIT © Oleksii Kyrychenko

## Canonical learning path

Read [concepts](/concepts), [guides](/guides/workflows), [mutation lifetimes](/guides/mutations),
[ownership](/advanced/ownership), [SSR](/advanced/ssr) and [observability](/advanced/observability).
See the [Core contract](/packages/react-action-guard/contract) and [migration](/packages/react-action-guard/migration)
for current source versus planned stabilization.

The [Core reference and recipes](./reference) contains the detailed package README material,
including specialized hooks, store control, middleware, typed scopes and advanced workflows.
