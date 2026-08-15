# React Action Guard TanStack

> TanStack Query integration for React Action Guard - seamless UI blocking for queries and mutations

## What is TanStack Integration?

This package provides hooks that combine TanStack Query with React Action Guard's blocking system. Automatically block UI during queries and mutations with zero boilerplate.

## Features

- **🔄 Automatic Blocking** - UI blocks based on query/mutation states
- **🎯 Scope-Based** - Block specific areas, not everything
- **📊 Priority System** - Control which operations take precedence
- **⚡ Tree-Shakeable** - Only include hooks you use
- **🔌 Drop-in Replacement** - Same API as TanStack Query hooks
- **💬 Dynamic Reasons** - Different messages for loading vs fetching
- **🎮 Full Control** - Configure exactly when to block
- **📘 TypeScript** - Full type inference from TanStack Query

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-tanstack @tanstack/react-query
```

**Peer Dependencies:**
- `@okyrychenko-dev/react-action-guard` ^0.6.0
- `@tanstack/react-query` ^5.0.0
- `react` ^17.0.0 || ^18.0.0 || ^19.0.0

## Quick Start

```tsx
import { useBlockingQuery } from '@okyrychenko-dev/react-action-guard-tanstack';

function UserProfile({ userId }: { userId: string }) {
  const query = useBlockingQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    blockingConfig: {
      scope: 'profile',
      reasonOnLoading: 'Loading profile...',
      onLoading: true,
    }
  });
  
  if (query.error) {
    return <div>Error: {query.error.message}</div>;
  }
  
  if (!query.data) {
    return null;
  }
  
  return <div>{query.data.name}</div>;
}
```

## React-Action-Guard Concepts

This integration goes beyond simple automatic blocking - it enables powerful patterns:

### Scope Isolation

Different UI sections block independently:

```tsx
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Query blocks 'users-table' scope
function UserTableLoader() {
  useBlockingQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    blockingConfig: { scope: 'users-table' }
  });
}

// Table reacts to its scope
function UserTable() {
  const isBlocked = useIsBlocked('users-table');
  // Blocked during load
}

// Sidebar stays interactive (different scope)
function Sidebar() {
  const isBlocked = useIsBlocked('sidebar');
  // isBlocked === false ✅
}
```

### useIsBlocked & useBlockingInfo

React to blocking state from any component:

```tsx
import { useIsBlocked, useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function StatusBar() {
  const blockers = useBlockingInfo('dashboard');
  if (blockers.length > 0) {
    return <div>{blockers[0].reason}</div>; // "Loading dashboard..."
  }
}

function ActionButton() {
  const isBlocked = useIsBlocked('checkout');
  return <button disabled={isBlocked}>Proceed</button>;
}
```

### Multi-Component Coordination

One query/mutation coordinates many components:

```tsx
// Component A: Sets blocking
const mutation = useBlockingMutation({
  mutationFn: saveData,
  blockingConfig: { scope: 'edit-mode' }
});

// Components B, C, D: All react automatically
function FormInputs() {
  const isBlocked = useIsBlocked('edit-mode'); // disabled during save
}
function CancelButton() {
  const isBlocked = useIsBlocked('edit-mode'); // disabled during save
}

// No prop drilling! 🎯
```

## API Overview

### useBlockingQuery

Drop-in replacement for `useQuery` with automatic blocking:

```typescript
const query = useBlockingQuery({
  // Standard TanStack Query options
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5000,
  
  // Blocking configuration
  blockingConfig: {
    scope: 'users',
    reasonOnLoading: 'Loading users...',
    reasonOnFetching: 'Refreshing users...',
    priority: 10,
    onLoading: true,
    onFetching: false,
  }
});
```

**Options:**

```typescript
interface BlockingConfig {
  scope?: string | string[];        // Scope to block (default: 'global')
  reasonOnLoading?: string;         // Reason during initial load
  reasonOnFetching?: string;        // Reason during background refresh
  reasonOnError?: string;           // Reason during error state
  priority?: number;                // Priority level (default: 10)
  timeout?: number;                 // Auto-remove timeout
  onLoading?: boolean;              // Block during loading (default: true)
  onFetching?: boolean;             // Block during fetching (default: false)
  onError?: boolean;                // Block during error (default: false)
}
```

**When to Block:**

```tsx
// Only block initial load
blockingConfig: {
  onLoading: true,
  onFetching: false,
}

// Block on background refresh too
blockingConfig: {
  onLoading: true,
  onFetching: true,
  reasonOnFetching: 'Refreshing...',
}

// Block on error
blockingConfig: {
  onError: true,
  reasonOnError: 'Retrying...',
}
```

### useBlockingMutation

Multi-component coordination - one mutation, many reactions:

```tsx
import { useBlockingMutation } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Component A: Mutation blocks scope
function SaveButton() {
  const mutation = useBlockingMutation({
    mutationFn: (data) => saveUser(data),
    blockingConfig: {
      scope: 'user-form',
      reasonOnPending: 'Saving user...',
      priority: 50,
    }
  });
  
  return <button onClick={() => mutation.mutate(formData)}>Save</button>;
}

// Component B: Form inputs react automatically
function FormInputs() {
  const isBlocked = useIsBlocked('user-form');
  return <input disabled={isBlocked} />;
}

// Component C: Cancel button reacts
function CancelButton() {
  const isBlocked = useIsBlocked('user-form');
  return <button disabled={isBlocked}>Cancel</button>;
}

// All synchronized via 'user-form' scope! 🎯
```

### useBlockingInfiniteQuery

For infinite scrolling with blocking:

```tsx
import { useBlockingInfiniteQuery } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function InfiniteList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    blockingConfig: {
      scope: 'items',
      reasonOnLoading: 'Loading items...',
      reasonOnFetching: 'Loading more...',
      onLoading: true,   // Block initial load
      onFetching: false, // Don't block "load more"
    }
  });
  
  const blockers = useBlockingInfo('items');
  
  if (blockers.length > 0) {
    // Initial load: show full-page loading
    return <div>{blockers[0].reason}</div>; // "Loading items..."
  }
  
  // Background pagination: show inline spinner
  return (
    <div>
      {query.data?.pages.map...}
      <button onClick={() => query.fetchNextPage()}>Load More</button>
    </div>
  );
}
```

### useBlockingQueries

Block during multiple parallel queries:

```tsx
import { useBlockingQueries } from '@okyrychenko-dev/react-action-guard-tanstack';
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

// Component A: Load data
function DashboardLoader() {
  const queries = useBlockingQueries(
    [
      { queryKey: ['user'], queryFn: fetchUser },
      { queryKey: ['posts'], queryFn: fetchPosts },
      { queryKey: ['stats'], queryFn: fetchStats },
    ],
    {
      scope: 'dashboard',
      reasonOnLoading: 'Loading dashboard...',
    }
  );
  return null;
}

// Component B: Dashboard reacts
function Dashboard() {
  const blockers = useBlockingInfo('dashboard');
  
  if (blockers.length > 0) {
    // Blocked until ALL 3 queries complete
    return <div>{blockers[0].reason}</div>;
  }
  
  return <div>{/* dashboard content */}</div>;
}
```

## Common Patterns

### Pattern 1: Scope Isolation

```tsx
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Product catalog (independent scope)
function ProductCatalog() {
  useBlockingInfiniteQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    blockingConfig: { scope: 'product-list' }
  });
}

// Product grid blocks during load
function ProductGrid() {
  const isBlocked = useIsBlocked('product-list');
  if (isBlocked) {
    return <Skeleton />;
  }
  return <div>{/* products */}</div>;
}

// Filters stay interactive
function ProductFilters() {
  const isBlocked = useIsBlocked('filters');
  // isBlocked === false - always works! ✅
}
```

### Pattern 2: Priority System

```tsx
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

// High priority payment
const payment = useBlockingMutation({
  mutationFn: processPayment,
  blockingConfig: {
    scope: 'checkout',
    priority: 100, // Highest
    reasonOnPending: 'Processing payment...',
  }
});

// Lower priority query
const query = useBlockingQuery({
  queryKey: ['cart'],
  queryFn: fetchCart,
  blockingConfig: {
    scope: 'checkout',
    priority: 50, // Lower
  }
});

// Shows highest priority reason
function Status() {
  const blockers = useBlockingInfo('checkout');
  return <div>{blockers[0]?.reason}</div>; // "Processing payment..."
}
```

### Pattern 3: Background Refresh

```tsx
import { useBlockingInfo } from '@okyrychenko-dev/react-action-guard';

function LiveDashboard() {
  const query = useBlockingQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 5000,
    blockingConfig: {
      scope: 'dashboard',
      reasonOnLoading: 'Loading...',
      reasonOnFetching: 'Updating...',
      onLoading: true,   // Block initial
      onFetching: false, // Don't block refresh ✅
    }
  });
  
  const blockers = useBlockingInfo('dashboard');
  
  // Initial: blockers.length > 0, full loading
  // Refresh: blockers.length === 0, subtle indicator
}
```

### Pattern 4: Multi-Scope Coordination

```tsx
import { useIsBlocked } from '@okyrychenko-dev/react-action-guard';

// Mutation blocks multiple scopes
function CheckoutSubmit() {
  const mutation = useBlockingMutation({
    mutationFn: submitOrder,
    blockingConfig: {
      scope: ['checkout', 'navigation', 'forms'],
      reasonOnPending: 'Processing order...',
      priority: 100,
    }
  });
}

// Components check their relevant scopes
function Header() {
  const isBlocked = useIsBlocked('navigation');
  // Navigation disabled
}

function CheckoutForm() {
  const isBlocked = useIsBlocked('forms');
  // All inputs disabled
}
```

## Comparison with Standard Hooks

### Before (Standard TanStack Query)

```tsx
function Component() {
  const query = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  // Manual blocking
  useBlocker('fetch-data', {
    scope: 'content',
    reason: 'Loading...',
  }, query.isLoading);
  
  return <div>{/* ... */}</div>;
}
```

### After (With Integration)

```tsx
function Component() {
  const query = useBlockingQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    blockingConfig: {
      scope: 'content',
      reasonOnLoading: 'Loading...',
    }
  });
  
  // Blocking is automatic!
  return <div>{/* ... */}</div>;
}
```

## TypeScript Support

Full type inference from TanStack Query:

```typescript
import type { BlockingConfig } from '@okyrychenko-dev/react-action-guard-tanstack';

interface User {
  id: string;
  name: string;
}

const query = useBlockingQuery({
  queryKey: ['user'],
  queryFn: (): Promise<User> => fetchUser(),
  blockingConfig: {
    scope: 'user',
    reasonOnLoading: 'Loading...',
  }
});

// query.data is typed as User | undefined
```

## Best Practices

1. **Don't block background refreshes** - Set `onFetching: false` usually
2. **Use specific scopes** - Avoid blocking 'global' for every query
3. **Set appropriate priorities** - Higher for user actions, lower for background
4. **Add timeouts** - Prevent infinite blocking
5. **Different reasons** - `reasonOnLoading` vs `reasonOnFetching`

## Related

- [React Action Guard](/packages/react-action-guard/) - Core blocking system
- [TanStack Query Docs](https://tanstack.com/query/latest) - TanStack Query documentation

## License

MIT © Oleksii Kyrychenko
