# Getting Started

This guide will help you get started with React Action Guard and its ecosystem.

## Overview

React Action Guard is a suite of packages for managing UI blocking states in React applications:

- **react-action-guard**: Core library for UI blocking management
- **react-action-guard-devtools**: Developer tools for debugging
- **react-action-guard-tanstack**: TanStack Query integration
- **react-zustand-toolkit**: Zustand store utilities (used internally)

## Installation

### Core Library

Install the core library and its peer dependency:

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

### DevTools (Optional, Development Only)

```bash
npm install -D @okyrychenko-dev/react-action-guard-devtools
```

### TanStack Query Integration (Optional)

If you're using TanStack Query:

```bash
npm install @okyrychenko-dev/react-action-guard-tanstack @tanstack/react-query
```

### Zustand Toolkit (Optional)

If you want to use the toolkit directly:

```bash
npm install @okyrychenko-dev/react-zustand-toolkit zustand
```

## Basic Usage

### Step 1: Create Your First Blocker

The simplest way to use React Action Guard is with the `useBlocker` hook:

```tsx
import { useBlocker, useIsBlocked } from '@okyrychenko-dev/react-action-guard';

function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  // Automatically block UI while saving
  useBlocker('save-operation', {
    scope: 'form',
    reason: 'Saving data...',
  }, isSaving);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveData();
    } finally {
      setIsSaving(false);
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Step 2: Check if UI is Blocked

Use `useIsBlocked` to check if a scope is currently blocked:

```tsx
function SubmitButton() {
  const isBlocked = useIsBlocked('form');

  return (
    <button disabled={isBlocked}>
      {isBlocked ? 'Blocked...' : 'Submit'}
    </button>
  );
}
```

### Step 3: Add DevTools (Development)

Add the DevTools component to your app:

```tsx
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

function App() {
  return (
    <>
      <YourApp />
      {/* DevTools auto-disabled in production - no check needed! */}
      <ActionGuardDevtools />
    </>
  );
}
```

## Key Concepts

### Scopes

Scopes define **what** gets blocked. You can use:

- **Global scope**: Blocks everything (`scope: 'global'`)
- **Named scopes**: Block specific areas (`scope: 'form'`, `scope: 'navigation'`)
- **Multiple scopes**: Block multiple areas at once (`scope: ['form', 'checkout']`)

```tsx
// Block only the form
useBlocker('form-save', { scope: 'form' }, isLoading);

// Block form and navigation
useBlocker('critical-op', { scope: ['form', 'navigation'] }, isCritical);

// Block everything
useBlocker('global-op', { scope: 'global' }, isGlobalLoading);
```

### Priorities

Priorities determine **which blocker wins** when multiple blockers target the same scope:

```tsx
// Low priority (default is 10)
useBlocker('background-task', { 
  scope: 'global', 
  priority: 5 
}, isBackgroundRunning);

// High priority - this one takes precedence
useBlocker('critical-task', { 
  scope: 'global', 
  priority: 100 
}, isCriticalRunning);
```

Higher priority = more important. Use `useBlockingInfo` to see the highest priority blocker:

```tsx
const blockers = useBlockingInfo('global');
if (blockers.length > 0) {
  const topBlocker = blockers[0]; // Highest priority blocker
  console.log(topBlocker.reason); // Why it's blocked
}
```

### Timeouts

Prevent infinite blocking with automatic timeouts:

```tsx
useBlocker('api-call', {
  scope: 'global',
  timeout: 30000, // Remove after 30 seconds
  onTimeout: (id) => {
    console.warn(`Operation ${id} timed out!`);
    showNotification('Request timed out');
  }
}, isLoading);
```

### Provider Pattern (Advanced)

For SSR, testing, or micro-frontends, use isolated stores:

```tsx
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

function App() {
  return (
    <UIBlockingProvider>
      <YourApp />
    </UIBlockingProvider>
  );
}
```

Each provider creates an isolated blocking state, perfect for:
- Server-side rendering (each request gets its own state)
- Testing (no cleanup between tests needed)
- Micro-frontends (each app has independent state)

## Common Patterns

### Form Submission

```tsx
function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useBlocker('form-submit', {
    scope: 'form',
    reason: 'Submitting form...',
    timeout: 60000, // 1 minute max
  }, isSubmitting);
  
  const isBlocked = useIsBlocked('form');
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitForm(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input disabled={isBlocked} />
      <button disabled={isBlocked} type="submit">
        Submit
      </button>
    </form>
  );
}
```

### Async Actions

Use `useAsyncAction` for automatic blocking:

```tsx
function DataFetcher() {
  const executeWithBlocking = useAsyncAction('fetch-data', 'global');
  
  const fetchData = () => executeWithBlocking(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
  
  return <button onClick={fetchData}>Fetch Data</button>;
}
```

### TanStack Query Integration

```tsx
import { useBlockingQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

function UserProfile() {
  const query = useBlockingQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    blockingConfig: {
      scope: 'profile',
      reasonOnLoading: 'Loading profile...',
      reasonOnFetching: 'Refreshing...',
      onLoading: true,
      onFetching: false, // Don't block on background refresh
    }
  });
  
  return <div>{query.data?.name}</div>;
}
```

## Next Steps

Now that you have the basics, explore more advanced topics:

- **[react-action-guard](/packages/react-action-guard/)** - Deep dive into the core library
- **[Middleware System](/packages/react-action-guard/guides/middleware-system)** - Add analytics and logging
- **[Advanced Patterns](/packages/react-action-guard/examples/advanced-patterns)** - Confirmable blockers, scheduled blocking
- **[Best Practices](/guides/best-practices)** - Tips for optimal usage
- **[Examples](/packages/react-action-guard/examples/basic-usage)** - Real-world examples

## Troubleshooting

### Blocker Not Working

Check that:
1. The blocker ID is unique
2. The `isActive` parameter is `true` (or omitted)
3. The scope name matches what you're checking

### DevTools Not Appearing

Make sure:
1. DevTools component is rendered
2. You're in development mode
3. No CSS conflicts hiding the toggle button

### Memory Leaks

Blockers are automatically cleaned up on unmount. If you see leaks:
1. Check that components are actually unmounting
2. Verify no manual store subscriptions without cleanup
3. Use the Provider pattern for isolated state

## TypeScript

All packages have full TypeScript support:

```typescript
import type {
  BlockerConfig,
  BlockerInfo,
  UseAsyncActionOptions,
} from '@okyrychenko-dev/react-action-guard';

const config: BlockerConfig = {
  scope: 'form',
  reason: 'Saving...',
  priority: 10,
};
```

For type-safe scopes:

```typescript
import { createTypedHooks } from '@okyrychenko-dev/react-action-guard';

type AppScopes = 'global' | 'form' | 'navigation' | 'checkout';

const { useBlocker, useIsBlocked } = createTypedHooks<AppScopes>();

// ✅ OK
useBlocker('save', { scope: 'form' });

// ❌ Type error
useBlocker('save', { scope: 'typo' });
```

## Getting Help

- **Documentation**: You're reading it! Explore the sidebar for detailed guides
- **Examples**: Check out the [examples section](/packages/react-action-guard/examples/basic-usage)
- **Issues**: [GitHub Issues](https://github.com/okyrychenko-dev/react-action-guard/issues)
- **npm**: [react-action-guard on npm](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)
