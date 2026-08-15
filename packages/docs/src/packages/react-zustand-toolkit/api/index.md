# Zustand Toolkit API Reference

Complete API documentation for React Zustand Toolkit.

## Store Creation

### createShallowStore

Create a Zustand store with automatic shallow comparison for all selectors.

```typescript
function createShallowStore<T>(
  creator: StateCreator<T>,
  options?: StoreOptions
): UseBoundStore<StoreApi<T>>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `creator` | `StateCreator<T>` | Zustand state creator function |
| `options` | `StoreOptions` | Optional configuration |

**StoreOptions:**

```typescript
interface StoreOptions {
  name?: string;              // Store name for DevTools
  enabled?: boolean;          // Enable DevTools (default: true in dev)
  anonymousActionType?: string; // Action name for DevTools
}
```

**Returns:** Hook for accessing the store with automatic shallow comparison

**Examples:**

```tsx
// Basic store
const useCounterStore = createShallowStore<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// With DevTools name
const useUserStore = createShallowStore<UserStore>(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
  }),
  { name: 'UserStore' }
);

// Usage in components
function Counter() {
  const { count, increment } = useCounterStore();
  // Automatically uses shallow comparison!
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

**Why Shallow?**

Without shallow comparison:

```tsx
// Standard Zustand - needs manual shallow
import { shallow } from 'zustand/shallow';

const { count, increment } = useStore(
  (state) => ({ count: state.count, increment: state.increment }),
  shallow // Must remember this!
);
```

With `createShallowStore`:

```tsx
// Automatic shallow comparison!
const { count, increment } = useStore(
  (state) => ({ count: state.count, increment: state.increment })
); // Just works!
```

---

### createStoreToolkit

Create a store with utilities (hook, api, provider).

```typescript
function createStoreToolkit<T>(
  creator: StateCreator<T>,
  options?: ToolkitOptions
): StoreToolkit<T>
```

**ToolkitOptions:**

```typescript
interface ToolkitOptions extends StoreOptions {
  enableProvider?: boolean;  // Enable provider pattern (default: false)
}
```

**Returns:**

```typescript
interface StoreToolkit<T> {
  useStore: UseBoundStore<StoreApi<T>>;  // React hook
  api: StoreApi<T>;                       // Direct API access
  Provider?: ComponentType<ProviderProps>; // Provider (if enableProvider: true)
}
```

**Examples:**

```tsx
// Create toolkit
const todoToolkit = createStoreToolkit<TodoStore>(
  (set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({
      todos: [...state.todos, todo]
    })),
  }),
  { name: 'Todos' }
);

// Export for use
export const useTodoStore = todoToolkit.useStore;
export const todoStoreApi = todoToolkit.api;

// Use hook
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  return <ul>{todos.map(renderTodo)}</ul>;
}

// Use API directly
function addTodoFromOutside(todo: Todo) {
  todoStoreApi.getState().addTodo(todo);
}

// Subscribe to changes
useEffect(() => {
  const unsubscribe = todoStoreApi.subscribe((state) => {
    console.log('Todos:', state.todos.length);
  });
  
  return unsubscribe;
}, []);
```

---

### createStoreProvider

Create a provider-based store for isolated instances.

```typescript
function createStoreProvider<T>(
  creator: StateCreator<T>,
  displayName?: string
): StoreProvider<T>
```

Provider lifecycle hooks are limited to `onStoreInit`, `onStoreReady`, and deprecated `onStoreCreate`.
Redux DevTools should be wired through `zustand/middleware/devtools` in the store creator rather than provider props.

**Returns:**

```typescript
interface StoreProvider<T> {
  Provider: ComponentType<ProviderProps>;
  useStore: UseBoundStore<StoreApi<T>>;
  useStoreApi: () => StoreApi<T>;
}
```

**ProviderProps:**

```typescript
interface ProviderProps {
  children: ReactNode;
  initialState?: Partial<T>;
  onStoreCreate?: (store: StoreApi<T>) => void;
}
```

**Examples:**

```tsx
// Create provider
const { Provider, useStore, useStoreApi } = createStoreProvider<CounterStore>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  'Counter'
);

// Use in app
function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  );
}

// Access store
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}

// With initial state
<Provider initialState={{ count: 10 }}>
  <Counter />
</Provider>

// With onCreate callback
<Provider
  onStoreCreate={(store) => {
    console.log('Store created:', store);
    
    // Subscribe
    store.subscribe((state) => {
      localStorage.setItem('count', String(state.count));
    });
  }}
>
  <Counter />
</Provider>

// Access store API
function ResetButton() {
  const store = useStoreApi();
  
  return (
    <button onClick={() => store.setState({ count: 0 })}>
      Reset
    </button>
  );
}
```

---

### createResolvedHooks

Create hooks that work with both global and context stores.

```typescript
function createResolvedHooks<T>(
  useGlobalStore: UseBoundStore<StoreApi<T>>,
  useContextStore: UseBoundStore<StoreApi<T>>
): ResolvedHooks<T>
```

**Returns:**

```typescript
interface ResolvedHooks<T> {
  useStore: UseBoundStore<StoreApi<T>>;  // Smart hook
  useStoreApi: () => StoreApi<T>;        // Get API
  useIsInsideProvider: () => boolean;    // Check context
}
```

**Examples:**

```tsx
// Global store
const useGlobalCounter = createShallowStore<CounterStore>(...);

// Provider store
const { Provider, useStore: useContextCounter } = createStoreProvider<CounterStore>(...);

// Create resolved hooks
const { useStore, useIsInsideProvider } = createResolvedHooks(
  useGlobalCounter,
  useContextCounter
);

// Component works anywhere!
function Counter() {
  const count = useStore((state) => state.count);
  const hasProvider = useIsInsideProvider();
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Using: {hasProvider ? 'Provider' : 'Global'} store</p>
    </div>
  );
}

// Without provider - uses global
<Counter />

// With provider - uses context
<Provider>
  <Counter />
</Provider>
```

---

## Middleware Support

All store creation functions support Zustand middleware.

### With DevTools

```typescript
import { devtools } from 'zustand/middleware';

const useStore = createShallowStore<Store>(
  devtools(
    (set) => ({
      // Store implementation
    }),
    { name: 'MyStore' }
  )
);
```

### With Persist

```typescript
import { persist } from 'zustand/middleware';

const useStore = createShallowStore<Store>(
  persist(
    (set) => ({
      // Store implementation
    }),
    { name: 'my-store' }
  )
);
```

### Combined Middleware

```typescript
import { devtools, persist } from 'zustand/middleware';

const useStore = createShallowStore<Store>(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      { name: 'counter-storage' }
    ),
    { name: 'Counter' }
  )
);
```

---

## Types

### StateCreator

Zustand state creator function type.

```typescript
type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void

type GetState<T> = () => T
```

---

### StoreApi

Direct store API for non-React usage.

```typescript
interface StoreApi<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}
```

**Examples:**

```tsx
// Get state
const state = storeApi.getState();
console.log(state.count);

// Set state
storeApi.setState({ count: 10 });
storeApi.setState((state) => ({ count: state.count + 1 }));

// Subscribe
const unsubscribe = storeApi.subscribe((state, prevState) => {
  if (state.count !== prevState.count) {
    console.log('Count changed:', state.count);
  }
});

// Cleanup
unsubscribe();
```

---

### UseBoundStore

Hook type for accessing store.

```typescript
type UseBoundStore<S extends StoreApi<T>> = {
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  api: S;
  getState: () => T;
  setState: (partial: Partial<T>) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}
```

---

## Patterns

### Pattern 1: Multiple Stores (Slices)

```tsx
// Auth slice
const useAuthStore = createShallowStore<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// UI slice
const useUIStore = createShallowStore<UIStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));

// Use in components
function App() {
  const user = useAuthStore((state) => state.user);
  const theme = useUIStore((state) => state.theme);
  
  return <div className={theme}>{/* ... */}</div>;
}
```

### Pattern 2: Generic CRUD Store

```tsx
function createCRUDStore<T extends { id: string }>(name: string) {
  return createShallowStore<CRUDStore<T>>(
    (set) => ({
      items: [],
      add: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      update: (id, updates) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      remove: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
    }),
    { name }
  );
}

// Use for different entities
const useUserStore = createCRUDStore<User>('Users');
const usePostStore = createCRUDStore<Post>('Posts');
```

### Pattern 3: Computed Values

```tsx
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  // Computed
  get total(): number;
  get itemCount(): number;
}

const useCartStore = createShallowStore<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  get total() {
    return get().items.reduce((sum, item) => sum + item.price, 0);
  },
  get itemCount() {
    return get().items.length;
  },
}));

// Usage
const total = useCartStore((state) => state.total);
const count = useCartStore((state) => state.itemCount);
```

### Pattern 4: Actions Factory

```tsx
const createActions = (set: SetState<TodoStore>) => ({
  addTodo: (text: string) => {
    const todo: Todo = {
      id: nanoid(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    set((state) => ({ todos: [...state.todos, todo] }));
  },
  toggleTodo: (id: string) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  })),
  removeTodo: (id: string) => set((state) => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })),
});

const useTodoStore = createShallowStore<TodoStore>((set) => ({
  todos: [],
  ...createActions(set),
}));
```

## Best Practices

1. **Use shallow stores**: Default to `createShallowStore` for convenience
2. **Split into slices**: Multiple focused stores vs one giant store
3. **Type everything**: Full TypeScript for type safety
4. **Use providers for SSR**: Isolated state per request
5. **Avoid over-selecting**: Select only what you need

## Comparison

### Plain Zustand

```tsx
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

const useStore = create<Store>((set) => ({
  count: 0,
  text: '',
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// Manual shallow
const { count, text } = useStore(
  (s) => ({ count: s.count, text: s.text }),
  shallow // Easy to forget!
);
```

### With Toolkit

```tsx
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

const useStore = createShallowStore<Store>((set) => ({
  count: 0,
  text: '',
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

// Automatic shallow!
const { count, text } = useStore((s) => ({
  count: s.count,
  text: s.text
}));
```

## Related

- [React Action Guard](/packages/react-action-guard/) - Uses this toolkit
- [Zustand](https://zustand-demo.pmnd.rs/) - The underlying library
