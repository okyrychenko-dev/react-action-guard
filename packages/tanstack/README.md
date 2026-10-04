# @okyrychenko-dev/react-action-guard-tanstack

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-tanstack.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> TanStack Query integration for React Action Guard - seamless UI blocking for queries and mutations

## Features

- 🔄 Automatic UI blocking based on query and mutation states
- 🎯 Scope-based blocking for granular control
- 📊 Priority system for managing multiple blockers
- 💬 Dynamic reasons - different messages for different states
- 🔒 Type-safe with full TypeScript support
- 🧠 Preserves TanStack Query inference for `select`, `initialData`, mutation variables, and `useQueries` tuples
- ⚡ TanStack Query integration for queries, infinite queries, mutations, and parallel queries
- 🧹 Automatic cleanup on component unmount
- ⚙️ Stable blocker lifecycle across rerenders and React `StrictMode`
- 🪝 4 specialized hooks - `useBlockingQuery`, `useBlockingMutation`, `useBlockingInfiniteQuery`, `useBlockingQueries`
- 🌳 Tree-shakeable - import only what you need
- 🎨 Clean architecture - shared utilities for maintainability

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
yarn add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
# or
pnpm add @okyrychenko-dev/react-action-guard-tanstack @okyrychenko-dev/react-action-guard @tanstack/react-query zustand
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) ^1.0.4 - The core UI blocking library
- [@tanstack/react-query](https://tanstack.com/query) ^5.90.10 - TanStack Query for data fetching
- [React](https://react.dev/) ^18.0.0 || ^19.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) - State management (peer dependency of react-action-guard)

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useBlockingQuery,
  useBlockingMutation,
} from "@okyrychenko-dev/react-action-guard-tanstack";
import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";

// Setup QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// Use in your components
function UserProfile() {
  const query = useBlockingQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    blockingConfig: {
      scope: "profile",
      reason: "Loading profile...",
    },
  });

  const isBlocked = useIsBlocked("profile");

  return (
    <div>
      {isBlocked && <LoadingSpinner />}
      {query.data && <UserInfo user={query.data} />}
    </div>
  );
}
```

## API Reference

All four hooks accept the native TanStack Query options and return the corresponding native result. `blockingConfig` controls one blocker owned by each mounted hook instance. The optional `queryClient` argument is supported on every hook.

| Hook                                                        | Blocking configuration                                         | Result                                                              | Default reason         | Default priority |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- | ---------------- |
| `useBlockingQuery(options, queryClient?)`                   | `options.blockingConfig: QueryBlockingConfig`                  | `UseQueryResult` (including defined `initialData` overload)         | `Loading data...`      | `10`             |
| `useBlockingInfiniteQuery(options, queryClient?)`           | `options.blockingConfig: InfiniteQueryBlockingConfig`          | `UseInfiniteQueryResult` (including defined `initialData` overload) | `Loading more data...` | `10`             |
| `useBlockingMutation(options, queryClient?)`                | `options.blockingConfig: MutationBlockingConfig`               | `UseMutationResult`                                                 | `Saving changes...`    | `30`             |
| `useBlockingQueries(queries, blockingConfig, queryClient?)` | `blockingConfig: QueriesBlockingConfig` applies to all queries | Inferred tuple of query results                                     | `Loading queries...`   | `10`             |

### Blocking configuration

| Option                                    | Meaning                                                                          | Default                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `scope?: string \| ReadonlyArray<string>` | Scope or scopes affected by this blocker; omitted scope uses core's global scope | Global scope                                    |
| `reason?: string`                         | Fallback blocking message                                                        | Hook-specific value above                       |
| `priority?: number`                       | Priority used by React Action Guard when several blockers apply                  | Hook-specific value above                       |
| `timeout?: number`                        | Milliseconds before the Blocking lifecycle removes the blocker                   | No timeout                                      |
| `onTimeout?: (blockerId: string) => void` | Called when the blocker times out; treat the ID as opaque                        | None                                            |
| `onLoading?: boolean`                     | Block active initial fetching; mutation pending always blocks                    | `true` for queries; always enabled for mutation |
| `onFetching?: boolean`                    | Block while fetching after initial load; not available for mutation              | `false`                                         |
| `onError?: boolean`                       | Keep blocking in an error state                                                  | `false`                                         |
| `reasonOnLoading?: string`                | Loading message for query and multi-query hooks                                  | Not set                                         |
| `reasonOnPending?: string`                | Pending message for mutation                                                     | Not set                                         |
| `reasonOnFetching?: string`               | Fetching message for query and multi-query hooks                                 | Not set                                         |
| `reasonOnError?: string`                  | Error message                                                                    | Not set                                         |

`onLoading` and `onFetching` are available on query, infinite-query, and multi-query configurations. Mutations always block while pending and do not have a fetching state.

### Migration: active loading by default

Query loading now means `isPending && isFetching` (TanStack's `isLoading`). Disabled queries without data and offline paused queries leave their scopes available, even though their status is pending. Initial requests block when they actually start and release after settlement or while paused. This applies to query, infinite-query, and query collections; an idle member does not keep a collection blocked.

Cached background requests do not block by default. Set `onFetching: true` to block refetches and infinite next/previous-page requests; paused fetches do not qualify. `reasonOnLoading` describes active initial requests, and `reasonOnFetching` describes background or pagination work. Error blocking still requires `onError: true`; mutation pending behavior is unchanged.

If your application previously relied on a disabled or paused pending query to lock a workflow, register that workflow condition separately with core's `useActionBlocker`. There is no query option for blocking solely because data is absent.

### State mapping and reason precedence

| Hook                       | Loading               | Fetching                                                          | Error                   |
| -------------------------- | --------------------- | ----------------------------------------------------------------- | ----------------------- |
| `useBlockingQuery`         | `isLoading`           | `isRefetching`                                                    | `isError`               |
| `useBlockingInfiniteQuery` | `isLoading`           | `isRefetching`, `isFetchingNextPage`, or `isFetchingPreviousPage` | `isError`               |
| `useBlockingMutation`      | `isPending`           | Not applicable                                                    | `isError`               |
| `useBlockingQueries`       | Any result is loading | Any result is refetching                                          | Any result has an error |

The enabled `onLoading`, `onFetching`, and `onError` options decide whether a blocker exists. When states overlap, the reason is selected in **loading → fetching → error** order from the first defined state-specific message; otherwise it falls back to `reason`. This reason precedence is independent of which blocking option is enabled. An empty string is a defined message.

The hooks use the nearest `UIBlockingProvider` store, or the global store when there is no provider. Each mounted hook owns its blocker; changing a query or mutation key releases its previous blocker, and unmounting releases only that hook's blocker. Cleanup remains safe in React `StrictMode`. `useBlockingQueries` owns one blocker for the whole query array, including dynamic arrays, and does not block for an empty array.

## Tree Shaking

The library is fully tree-shakeable. Import only the hooks you need to keep your bundle size small:

```tsx
import { useBlockingQuery } from "@okyrychenko-dev/react-action-guard-tanstack";
```

The package is configured with `"sideEffects": false`, allowing modern bundlers (Webpack, Rollup, Vite) to eliminate unused code automatically.

## TypeScript

The package is written in TypeScript and includes full type definitions.

Type fidelity is intentionally close to native TanStack Query behavior:

- `useBlockingQuery` preserves `select` inference and `initialData` overload behavior
- `useBlockingInfiniteQuery` preserves infinite-query result typing
- `useBlockingMutation` preserves mutation result and variable inference
- `useBlockingQueries` preserves tuple inference for mixed query arrays
- wrapper defaults follow TanStack Query's `DefaultError`
- all wrappers accept the optional `queryClient` parameter, like the native hooks

```typescript
import type {
  // Hook options types
  UseBlockingQueryOptions,
  UseBlockingMutationOptions,
  UseBlockingInfiniteQueryOptions,
  UseBlockingQueriesOptions,

  // Config types
  QueryBlockingConfig,
  MutationBlockingConfig,
  InfiniteQueryBlockingConfig,
  QueriesBlockingConfig,

  // Base types
  BaseBlockingConfig,
} from "@okyrychenko-dev/react-action-guard-tanstack";

// Usage with type parameters
interface User {
  id: number;
  name: string;
  email: string;
}

const query = useBlockingQuery<User>({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  blockingConfig: {
    scope: "user",
    reason: "Loading user...",
  },
});

const mutation = useBlockingMutation<User, Error, { name: string }>({
  mutationFn: (variables) => createUser(variables),
  blockingConfig: {
    scope: "user-form",
    reasonOnPending: "Creating user...",
  },
});
```

## Runtime Stability

Blocker synchronization is designed to stay stable across rerenders.

- Inline `blockingConfig` objects update the existing blocker instead of causing remove/add churn
- Cleanup is safe under React `StrictMode`
- Query and mutation blocker IDs stay unique per hook instance, even when keys match

## React-Action-Guard Concepts

This package integrates TanStack Query with React-Action-Guard's powerful scope-based UI blocking system. Here are the key concepts:

### Scope Isolation

Different parts of your UI can block independently via scopes:

```tsx
import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";

// Query blocks 'users-table' scope
function UserTableLoader() {
  useBlockingQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    blockingConfig: { scope: "users-table" },
  });
}

// Table checks its scope
function UserTable() {
  const isBlocked = useIsBlocked("users-table");
  // Blocked during query load
}

// Sidebar has different scope - stays interactive
function Sidebar() {
  const isBlocked = useIsBlocked("sidebar");
  // isBlocked === false ✅
}
```

### useIsBlocked & useBlockingInfo

React to blocking state from any component:

```tsx
import { useIsBlocked, useBlockingInfo } from "@okyrychenko-dev/react-action-guard";

// Anywhere in your app
function StatusBar() {
  const blockers = useBlockingInfo("dashboard");

  if (blockers.length > 0) {
    return <div>{blockers[0].reason}</div>; // "Loading dashboard..."
  }
  return null;
}

function SaveButton() {
  const isBlocked = useIsBlocked("checkout");
  return <button disabled={isBlocked}>Proceed</button>;
}
```

### Multi-Component Coordination

One query/mutation coordinates many components automatically:

```tsx
// Component A: Sets blocking
function SaveData() {
  const mutation = useBlockingMutation({
    mutationFn: saveData,
    blockingConfig: { scope: "edit-mode" },
  });
}

// Components B, C, D: All react automatically
function FormInputs() {
  const isBlocked = useIsBlocked("edit-mode");
  // Inputs disabled during save
}

function CancelButton() {
  const isBlocked = useIsBlocked("edit-mode");
  // Button disabled during save
}

function NavigationLinks() {
  const isBlocked = useIsBlocked("edit-mode");
  // Navigation blocked during save
}

// No prop drilling! No context! Just scope-based coordination 🎯
```

### Priority System

Higher priority blockers override lower ones:

```tsx
// Mutation default priority: 30 (higher than queries: 10)
const paymentMutation = useBlockingMutation({
  mutationFn: processPayment,
  blockingConfig: {
    scope: "checkout",
    priority: 100, // Highest
  },
});

const query = useBlockingQuery({
  queryKey: ["cart"],
  queryFn: fetchCart,
  blockingConfig: {
    scope: "checkout",
    priority: 50, // Lower - won't block if payment is processing
  },
});

// Only highest priority blocker's reason is shown
const blockers = useBlockingInfo("checkout");
const topReason = blockers[0]?.reason; // From priority 100
```

### Blocker ID Behavior

`blockerId` (including the value passed to `onTimeout`) should be treated as an opaque identifier.

- For query/mutation hooks, IDs are unique per hook instance.
- Same `queryKey`/`mutationKey` in two mounted components now creates two independent blockers.
- Unmounting one instance does not remove another instance's blocker.

## Use Cases

### Loading States

```tsx
function DataLoader() {
  const query = useBlockingQuery({
    queryKey: ["data"],
    queryFn: fetchData,
    blockingConfig: {
      scope: "content",
      reasonOnLoading: "Loading data...",
      onLoading: true,
    },
  });

  // ... rest of component
}
```

### Form Submission

```tsx
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function UserForm() {
  const mutation = useBlockingMutation({
    mutationFn: submitForm,
    blockingConfig: {
      scope: "form",
      reasonOnPending: "Submitting form...",
      reasonOnError: "Failed to submit",
      onError: true,
    },
  });

  const isBlocked = useIsBlocked("form");

  const handleSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input disabled={isBlocked} />
      <button disabled={isBlocked}>Submit</button>
    </form>
  );
}
```

### Infinite Scrolling

```tsx
import { useBlockingInfiniteQuery } from "@okyrychenko-dev/react-action-guard-tanstack";

function InfinitePostList() {
  const query = useBlockingInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    blockingConfig: {
      scope: "post-list",
      reasonOnLoading: "Loading posts...",
      reasonOnFetching: "Loading more posts...",
      onLoading: true,
      onFetching: true,
    },
  });

  return (
    <div>
      {query.data?.pages.map((page) =>
        page.posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
      {query.hasNextPage && <button onClick={() => query.fetchNextPage()}>Load More</button>}
    </div>
  );
}
```

### Multiple Parallel Queries

```tsx
import { useBlockingQueries } from "@okyrychenko-dev/react-action-guard-tanstack";

function UserDashboard({ userId }) {
  const results = useBlockingQueries(
    [
      { queryKey: ["user", userId], queryFn: () => fetchUser(userId) },
      { queryKey: ["posts", userId], queryFn: () => fetchUserPosts(userId) },
      { queryKey: ["stats", userId], queryFn: () => fetchUserStats(userId) },
    ],
    {
      scope: "user-dashboard",
      reasonOnLoading: "Loading dashboard...",
      onLoading: true,
    }
  );

  const [userQuery, postsQuery, statsQuery] = results;

  return (
    <div>
      <h1>{userQuery.data?.name}</h1>
      <p>Posts: {postsQuery.data?.length}</p>
      <p>Total views: {statsQuery.data?.views}</p>
    </div>
  );
}
```

### Global Loading Overlay

```tsx
import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function App() {
  const isGloballyBlocked = useIsBlocked("global");

  return (
    <div>
      {isGloballyBlocked && <LoadingOverlay />}
      <YourApp />
    </div>
  );
}

function SomeComponent() {
  const query = useBlockingQuery({
    queryKey: ["critical-data"],
    queryFn: fetchCriticalData,
    blockingConfig: {
      scope: "global", // Blocks entire app
      reasonOnLoading: "Loading critical data...",
    },
  });

  return <div>Content</div>;
}
```

### Multi-Step Process with Priority

```tsx
function MultiStepWizard() {
  const [step, setStep] = useState(1);

  // Higher priority for payment step
  const paymentMutation = useBlockingMutation({
    mutationFn: processPayment,
    blockingConfig: {
      scope: ["navigation", "form"],
      reasonOnPending: "Processing payment...",
      priority: 100, // High priority
    },
  });

  // Lower priority for other steps
  const saveDraftMutation = useBlockingMutation({
    mutationFn: saveDraft,
    blockingConfig: {
      scope: "navigation",
      reasonOnPending: "Saving draft...",
      priority: 50, // Lower priority
    },
  });

  return <div>Step {step}</div>;
}
```

### Background Refetch Without Blocking

```tsx
function LiveData() {
  const query = useBlockingQuery({
    queryKey: ["live-data"],
    queryFn: fetchLiveData,
    refetchInterval: 5000, // Refetch every 5 seconds
    blockingConfig: {
      scope: "dashboard",
      onLoading: true, // Block initial load
      onFetching: false, // Don't block background refetch
      reasonOnLoading: "Loading data...",
    },
  });

  return <div>Data: {query.data?.value}</div>;
}
```

### Conditional Error Blocking

```tsx
function CriticalDataLoader() {
  const query = useBlockingQuery({
    queryKey: ["critical-data"],
    queryFn: fetchCriticalData,
    blockingConfig: {
      scope: "app",
      onError: true, // Block UI on error
      reasonOnLoading: "Loading critical data...",
      reasonOnError: "Critical error - please refresh",
    },
  });

  return <div>Content</div>;
}
```

## Development

This package lives in the [react-action-guard monorepo](https://github.com/okyrychenko-dev/react-action-guard)
(pnpm workspaces). From the monorepo root:

```bash
# Install dependencies for all packages
pnpm install

# Run this package's scripts with --filter
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run test:run
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run test:coverage
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run build
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run typecheck
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run lint
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run lint:fix
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run format
pnpm --filter @okyrychenko-dev/react-action-guard-tanstack run dev

# Or cd into the package and run scripts directly
cd packages/tanstack
pnpm run test:run
```

## Contributing

Contributions are welcome! Please ensure, before opening a PR:

1. All tests pass (`pnpm run test`)
2. Code is properly typed (`pnpm run typecheck`)
3. Linting passes (`pnpm run lint`)
4. Code is formatted (`pnpm run format`)
5. If the change affects this package's public behavior, add a changeset: `pnpm changeset`
   (see the [Releasing](https://github.com/okyrychenko-dev/react-action-guard#releasing) section
   of the monorepo README)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## License

MIT © Oleksii Kyrychenko
