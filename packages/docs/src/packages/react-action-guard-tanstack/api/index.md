# TanStack Query Integration API Reference

Complete API documentation for React Action Guard TanStack Query integration.

## Hooks

### useBlockingQuery

Drop-in replacement for TanStack Query's `useQuery` with automatic UI blocking.

```typescript
function useBlockingQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseBlockingQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError>
```

**Options:**

Includes all TanStack Query options plus:

```typescript
interface UseBlockingQueryOptions<TData, TError, TQueryKey> 
  extends UseQueryOptions<TData, TError, TQueryKey> {
  blockingConfig?: BlockingConfig;
}
```

**BlockingConfig:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `scope` | `string \| string[]` | `'global'` | Scope(s) to block |
| `reasonOnLoading` | `string` | `''` | Reason during initial load |
| `reasonOnFetching` | `string` | `''` | Reason during background fetch |
| `reasonOnError` | `string` | `''` | Reason during error state |
| `priority` | `number` | `10` | Priority level (0-100) |
| `timeout` | `number` | `undefined` | Auto-remove timeout (ms) |
| `onLoading` | `boolean` | `true` | Block during `isLoading` |
| `onFetching` | `boolean` | `false` | Block during `isFetching` |
| `onError` | `boolean` | `false` | Block during error state |

**Examples:**

```tsx
// Basic usage
const query = useBlockingQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  blockingConfig: {
    scope: 'users',
    reasonOnLoading: 'Loading users...',
  }
});

// Don't block background refresh
const query = useBlockingQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  blockingConfig: {
    scope: 'posts',
    reasonOnLoading: 'Loading posts...',
    reasonOnFetching: 'Refreshing...',
    onLoading: true,
    onFetching: false, // Key: don't block refresh
  }
});

// Block on error (for retries)
const query = useBlockingQuery({
  queryKey: ['critical-data'],
  queryFn: fetchCriticalData,
  retry: 3,
  blockingConfig: {
    scope: 'critical',
    reasonOnLoading: 'Loading...',
    reasonOnError: 'Retrying...',
    onLoading: true,
    onError: true,
    priority: 80,
  }
});

// Multiple scopes
const query = useBlockingQuery({
  queryKey: ['checkout-info'],
  queryFn: fetchCheckoutInfo,
  blockingConfig: {
    scope: ['checkout', 'navigation'],
    reasonOnLoading: 'Loading checkout information...',
    priority: 90,
    timeout: 30000,
  }
});
```

**Returns:** Same as `useQuery` from TanStack Query

---

### useBlockingMutation

Drop-in replacement for `useMutation` with automatic UI blocking.

```typescript
function useBlockingMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseBlockingMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext>
```

**Options:**

```typescript
interface UseBlockingMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  blockingConfig?: MutationBlockingConfig;
}

interface MutationBlockingConfig {
  scope?: string | string[];
  reasonOnLoading?: string;      // Reason during mutation
  reasonOnError?: string;        // Reason on error (if onError: true)
  priority?: number;
  timeout?: number;
  onLoading?: boolean;           // Block during isPending
  onError?: boolean;             // Block during error
}
```

**Examples:**

```tsx
// Form submission
const mutation = useBlockingMutation({
  mutationFn: (data) => api.createUser(data),
  blockingConfig: {
    scope: 'user-form',
    reasonOnLoading: 'Creating user...',
    priority: 50,
    timeout: 30000,
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    showNotification('User created!', 'success');
  },
  onError: (error) => {
    showNotification(`Error: ${error.message}`, 'error');
  },
});

// Critical operation
const mutation = useBlockingMutation({
  mutationFn: processPayment,
  blockingConfig: {
    scope: ['checkout', 'navigation'],
    reasonOnLoading: 'Processing payment...',
    priority: 100,
    timeout: 60000,
  },
  retry: 2,
});

// Optimistic update
const mutation = useBlockingMutation({
  mutationFn: (id) => api.toggleComplete(id),
  blockingConfig: {
    scope: `todo-${todoId}`,
    reasonOnLoading: 'Updating...',
    priority: 10,
  },
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData(['todos']);
    
    queryClient.setQueryData(['todos'], (old: Todo[]) =>
      old.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['todos'], context?.previous);
  },
});
```

**Returns:** Same as `useMutation` from TanStack Query

---

### useBlockingInfiniteQuery

Infinite scrolling with automatic blocking.

```typescript
function useBlockingInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown
>(
  options: UseBlockingInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>
): UseInfiniteQueryResult<TData, TError>
```

**Options:**

```typescript
interface UseBlockingInfiniteQueryOptions<TData, TError, TQueryKey, TPageParam>
  extends UseInfiniteQueryOptions<TData, TError, TQueryKey, TPageParam> {
  blockingConfig?: InfiniteQueryBlockingConfig;
}

interface InfiniteQueryBlockingConfig extends BlockingConfig {
  reasonOnFetchingNextPage?: string;  // During fetchNextPage
  reasonOnFetchingPrevPage?: string;  // During fetchPreviousPage
  onFetchingNextPage?: boolean;       // Block on next page
  onFetchingPrevPage?: boolean;       // Block on previous page
}
```

**Examples:**

```tsx
const query = useBlockingInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0,
  blockingConfig: {
    scope: 'posts',
    reasonOnLoading: 'Loading posts...',
    reasonOnFetchingNextPage: 'Loading more posts...',
    onLoading: true,
    onFetchingNextPage: false, // Don't block "load more"
  }
});

return (
  <div>
    {query.data?.pages.map((page, i) => (
      <div key={i}>
        {page.posts.map(post => <Post key={post.id} {...post} />)}
      </div>
    ))}
    
    <button
      onClick={() => query.fetchNextPage()}
      disabled={!query.hasNextPage}
    >
      Load More
    </button>
  </div>
);
```

---

### useBlockingQueries

Multiple parallel queries with blocking.

```typescript
function useBlockingQueries<T extends any[]>(
  options: UseBlockingQueriesOptions<T>
): QueriesResults<T>
```

**Options:**

```typescript
interface UseBlockingQueriesOptions<T> {
  queries: Array<UseBlockingQueryOptions & { blockingConfig?: BlockingConfig }>;
  combine?: (results: QueriesResults<T>) => any;
}
```

**Examples:**

```tsx
const [userQuery, postsQuery, statsQuery] = useBlockingQueries({
  queries: [
    {
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
      blockingConfig: {
        scope: 'dashboard',
        reasonOnLoading: 'Loading user...',
      }
    },
    {
      queryKey: ['posts', userId],
      queryFn: () => fetchUserPosts(userId),
      blockingConfig: {
        scope: 'dashboard',
        reasonOnLoading: 'Loading posts...',
      }
    },
    {
      queryKey: ['stats', userId],
      queryFn: () => fetchUserStats(userId),
      blockingConfig: {
        scope: 'dashboard',
        reasonOnLoading: 'Loading stats...',
      }
    },
  ]
});

const isLoading = userQuery.isLoading || postsQuery.isLoading || statsQuery.isLoading;

if (isLoading) {
  return <LoadingScreen />;
}

return (
  <Dashboard
    user={userQuery.data}
    posts={postsQuery.data}
    stats={statsQuery.data}
  />
);
```

---

## Types

### BlockingConfig

Configuration for query blocking behavior.

```typescript
interface BlockingConfig {
  scope?: string | string[];
  reasonOnLoading?: string;
  reasonOnFetching?: string;
  reasonOnError?: string;
  priority?: number;
  timeout?: number;
  onLoading?: boolean;
  onFetching?: boolean;
  onError?: boolean;
}
```

---

### MutationBlockingConfig

Configuration for mutation blocking behavior.

```typescript
interface MutationBlockingConfig {
  scope?: string | string[];
  reasonOnLoading?: string;
  reasonOnError?: string;
  priority?: number;
  timeout?: number;
  onLoading?: boolean;
  onError?: boolean;
}
```

---

### InfiniteQueryBlockingConfig

Configuration for infinite query blocking.

```typescript
interface InfiniteQueryBlockingConfig extends BlockingConfig {
  reasonOnFetchingNextPage?: string;
  reasonOnFetchingPrevPage?: string;
  onFetchingNextPage?: boolean;
  onFetchingPrevPage?: boolean;
}
```

---

## Patterns

### Pattern 1: List with Refresh

Don't block UI on background refresh:

```tsx
const query = useBlockingQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
  refetchInterval: 30000,
  blockingConfig: {
    scope: 'items',
    reasonOnLoading: 'Loading items...',
    reasonOnFetching: 'Refreshing...',
    onLoading: true,
    onFetching: false, // Key: allow background refresh
  }
});
```

### Pattern 2: Critical Data

Block everything during critical operations:

```tsx
const mutation = useBlockingMutation({
  mutationFn: deleteAccount,
  blockingConfig: {
    scope: 'global',
    reasonOnLoading: 'Deleting account...',
    priority: 1000,
    timeout: 30000,
  },
});
```

### Pattern 3: Dependent Queries

Load queries in sequence:

```tsx
const userQuery = useBlockingQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  blockingConfig: {
    scope: 'profile',
    reasonOnLoading: 'Loading user...',
  }
});

const postsQuery = useBlockingQuery({
  queryKey: ['posts', userQuery.data?.id],
  queryFn: () => fetchPosts(userQuery.data!.id),
  enabled: !!userQuery.data,
  blockingConfig: {
    scope: 'profile',
    reasonOnLoading: 'Loading posts...',
  }
});
```

### Pattern 4: Form with Mutation

```tsx
function UserForm() {
  const mutation = useBlockingMutation({
    mutationFn: (data: UserData) => api.updateUser(data),
    blockingConfig: {
      scope: ['user-form', 'navigation'],
      reasonOnLoading: 'Saving user...',
      priority: 50,
      timeout: 30000,
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/users');
    },
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate(formData);
    }}>
      {/* form fields */}
      <button type="submit" disabled={mutation.isPending}>
        Save
      </button>
    </form>
  );
}
```

### Pattern 5: Paginated Table

```tsx
const [page, setPage] = useState(0);

const query = useBlockingQuery({
  queryKey: ['users', page],
  queryFn: () => fetchUsers(page),
  placeholderData: keepPreviousData, // TanStack v5
  blockingConfig: {
    scope: 'users-table',
    reasonOnLoading: 'Loading page...',
    onLoading: true,
    onFetching: false, // Don't block pagination
  }
});

return (
  <div>
    <Table data={query.data} />
    <Pagination
      page={page}
      onChange={setPage}
      disabled={query.isLoading}
    />
  </div>
);
```

## Best Practices

1. **Don't block background refreshes**: Set `onFetching: false` for UX
2. **Use specific scopes**: Avoid blocking `'global'` for each query
3. **Set appropriate priorities**: Higher for user actions
4. **Add timeouts**: Prevent infinite blocking on network issues
5. **Different reasons**: Distinguish loading vs fetching vs error
6. **Selective blocking**: Only block what's necessary

## Migration from Standard Hooks

### Before

```tsx
const query = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

useBlocker('fetch-data', {
  scope: 'content',
  reason: 'Loading...',
}, query.isLoading);
```

### After

```tsx
const query = useBlockingQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  blockingConfig: {
    scope: 'content',
    reasonOnLoading: 'Loading...',
  }
});
// Blocking is automatic!
```

## TypeScript

Full type inference from TanStack Query:

```typescript
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
const userName = query.data?.name;
```

## Related

- [React Action Guard](/packages/react-action-guard/) - Core blocking system
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview) - TanStack Query docs
- [Examples](/packages/react-action-guard/examples/basic-usage) - Usage examples
