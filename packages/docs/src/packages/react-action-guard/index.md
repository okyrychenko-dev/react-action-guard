# React Action Guard

> Elegant UI blocking management for React applications with priorities, scopes, and automatic cleanup

## What isReact Action Guard?

React Action Guard is a comprehensive solution for managing UI blocking states in React applications. It provides a declarative, priority-based system for coordinating when and how your UI should be blocked during async operations.

## Key Features

### 🎯 Priority-Based Blocking
Manage multiple concurrent blockers with configurable priorities. Higher priority operations automatically take precedence, ensuring critical tasks always block the UI when needed.

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
import { useBlocker, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Automatically block UI while loading
  useBlocker('my-operation', {
    scope: 'form',
    reason: 'Saving data...',
    priority: 10,
  }, isLoading);
  
  const isFormBlocked = useIsBlocked('form');
  
  return (
    <button disabled={isFormBlocked}>
      Submit
    </button>
  );
}
```

## Core Concepts

### Blockers

A blocker is a temporary state that indicates the UI should be blocked. Each blocker has:

- **ID**: Unique identifier
- **Scope**: What areas to block (`string | string[]`)
- **Priority**: Importance level (`number`, default: 10)
- **Reason**: Human-readable explanation
- **Timeout**: Optional auto-removal duration

```tsx
useBlocker('blocker-id', {
  scope: ['form', 'navigation'],
  priority: 50,
  reason: 'Critical operation',
  timeout: 30000, // 30 seconds
  onTimeout: (id) => console.warn(`${id} timed out`)
}, isActive);
```

### Scopes

Scopes define **what** gets blocked:

```tsx
// Block form only
useBlocker('save', { scope: 'form' }, isSaving);

// Block multiple scopes
useBlocker('checkout', { scope: ['form', 'navigation'] }, isCheckingOut);

// Block everything
useBlocker('critical', { scope: 'global' }, isCritical);
```

Check if a scope is blocked:

```tsx
const isFormBlocked = useIsBlocked('form');
const isAnyBlocked = useIsBlocked(['form', 'navigation']); // true if ANY are blocked
```

### Priorities

When multiple blockers target the same scope, priority determines which one's reason is displayed:

```tsx
// Lower priority
useBlocker('bg-task', { scope: 'global', priority: 5 }, isBgRunning);

// Higher priority - takes precedence
useBlocker('important', { scope: 'global', priority: 100 }, isImportantRunning);
```

Get blocker information sorted by priority:

```tsx
const blockers = useBlockingInfo('global');
const topBlocker = blockers[0]; // Highest priority
console.log(topBlocker.reason);
```

## API Overview

### Hooks

- **[useBlocker](/packages/react-action-guard/api/hooks#useblocker)** - Automatically add/remove blocker
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
  blockers: Map<string, StoredBlocker>;
  
  // Actions
  addBlocker: (id: string, config: BlockerConfig) => void;
  removeBlocker: (id: string) => void;
  updateBlocker: (id: string, config: Partial<BlockerConfig>) => void;
  isBlocked: (scope?: string | string[]) => boolean;
  getBlockingInfo: (scope?: string) => BlockerInfo[];
  clearAllBlockers: () => void;
  clearBlockersForScope: (scope: string) => void;
  registerMiddleware: (name: string, middleware: Middleware) => void;
  unregisterMiddleware: (name: string) => void;
}
```

[Learn more about the architecture →](./architecture)

## Use Cases

### Form Blocking

```tsx
function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useBlocker('form-submit', {
    scope: 'form',
    reason: 'Submitting...',
  }, isSubmitting);
  
  const isBlocked = useIsBlocked('form');
  
  return (
    <form>
      <input disabled={isBlocked} />
      <button disabled={isBlocked} type="submit">Submit</button>
    </form>
  );
}
```

### Loading States

```tsx
function DataLoader() {
  const executeWithBlocking = useAsyncAction('load-data', 'content');
  
  const loadData = () => executeWithBlocking(async () => {
    const data = await fetchData();
    setData(data);
  });
  
  return <button onClick={loadData}>Load Data</button>;
}
```

### Unsaved Changes Protection

```tsx
function FormWithWarning() {
  const { execute, isDialogOpen, onConfirm, onCancel } = useConfirmableBlocker(
    'unsaved-changes',
    {
      scope: 'navigation',
      confirmMessage: 'You have unsaved changes. Discard them?',
      onConfirm: () => navigate('/away'),
    }
  );
  
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
