# React Zustand Toolkit

> A powerful toolkit for creating type-safe Zustand stores with automatic shallow comparison, provider patterns, and smart context resolution

## What is React Zustand Toolkit?

A utility library that enhances Zustand with:
- **Automatic shallow comparison** for all selectors
- **Provider pattern** for isolated store instances
- **Smart resolution** between global and context stores
- **Full TypeScript support** with type inference
- **Zero configuration** - works out of the box

**Note:** This package is used internally by `@okyrychenko-dev/react-action-guard` but can be used standalone for any Zustand store.

## Features

- **🎯 Automatic Shallow Comparison** - No manual equality checks needed
- **🏗️ Provider Pattern** - Create isolated instances for SSR and testing
- **🔍 Smart Resolution** - Hooks auto-detect global vs context stores
- **📘 TypeScript First** - Full type safety and inference
- **⚡ Tree-Shakeable** - Import only what you need
- **🪶 Lightweight** - Minimal wrapper over Zustand
- **🔌 Drop-in Replacement** - Compatible with existing Zustand stores

## Installation

```bash
npm install @okyrychenko-dev/react-zustand-toolkit zustand
```

**Peer Dependencies:**
- `react` ^17.0.0 || ^18.0.0 || ^19.0.0
- `zustand` ^4.5.7 || ^5.0.0

## Quick Start

### Basic Store

```typescript
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Create store with automatic shallow comparison
export const useCounterStore = createShallowStore<CounterStore>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  })
);

// Use in components
function Counter() {
  const { count, increment } = useCounterStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## Core APIs

### createShallowStore

Create a Zustand store with automatic shallow comparison:

```typescript
const useStore = createShallowStore<StoreState>(
  (set, get) => ({
    // Your store implementation
  }),
  {
    name: 'MyStore', // Optional: for DevTools
  }
);
```

**Benefits:**
- Selectors use shallow equality by default
- Fewer unnecessary re-renders
- No need to manually specify equality function

### createStoreToolkit

Enhanced store with more utilities:

```typescript
import { createStoreToolkit } from '@okyrychenko-dev/react-zustand-toolkit';

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
}

const todoToolkit = createStoreToolkit<TodoStore>(
  (set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({
      todos: [...state.todos, todo]
    })),
    removeTodo: (id) => set((state) => ({
      todos: state.todos.filter(t => t.id !== id)
    })),
  }),
  { name: 'Todos' }
);

// Access store and hooks
export const useTodoStore = todoToolkit.useStore;
export const todoStoreApi = todoToolkit.api;
```

**Returns:**
```typescript
{
  useStore: Hook,           // React hook
  api: StoreApi,           // Direct store access
  Provider: ComponentType, // Provider component (if enabled)
}
```

### createStoreProvider

Create provider for isolated store instances:

```typescript
import { createStoreProvider } from '@okyrychenko-dev/react-zustand-toolkit';

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

function Counter() {
  const count = useStore((state) => state.count);
  return <div>{count}</div>;
}
```

### createResolvedHooks

Smart hooks that work with both global and context stores:

```typescript
import { createResolvedHooks } from '@okyrychenko-dev/react-zustand-toolkit';

// Create provider
const { Provider, useStore: useContextStore } = createStoreProvider(...);

// Create resolved hooks
const { useStore } = createResolvedHooks(useGlobalStore, useContextStore);

// Hook automatically uses:
// 1. Context store if inside Provider
// 2. Global store otherwise

function Component() {
  const state = useStore(); // Works anywhere!
}
```

## Usage Patterns

### Pattern 1: Global Store

```typescript
// store.ts
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

export const useAppStore = createShallowStore<AppStore>(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
  })
);

// component.tsx
function Header() {
  const user = useAppStore((state) => state.user);
  return <div>{user?.name}</div>;
}
```

### Pattern 2: Provider for SSR

```typescript
// provider.tsx
import { createStoreProvider } from '@okyrychenko-dev/react-zustand-toolkit';

export const { Provider, useStore } = createStoreProvider<AppStore>(
  (set) => ({
    // Store implementation
  }),
  'App'
);

// app.tsx
function App({ children }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
}
```

### Pattern 3: Smart Resolution

```typescript
// Global store
const useGlobalCounter = createShallowStore<CounterStore>(...);

// Provider
const { Provider, useStore: useContextCounter } = createStoreProvider<CounterStore>(...);

// Smart hooks
const { useStore: useCounter } = createResolvedHooks(useGlobalCounter, useContextCounter);

// Component works with or without provider
function Counter() {
  const count = useCounter((state) => state.count);
  return <div>{count}</div>;
}

// Without provider - uses global
<Counter />

// With provider - uses context
<Provider>
  <Counter />
</Provider>
```

### Pattern 4: Slices

```typescript
// Create multiple stores as slices
const useAuthStore = createShallowStore<AuthStore>(...);
const useUIStore = createShallowStore<UIStore>(...);
const useDataStore = createShallowStore<DataStore>(...);

// Combine in components
function App() {
  const user = useAuthStore((state) => state.user);
  const theme = useUIStore((state) => state.theme);
  const data = useDataStore((state) => state.data);
  
  return <div>{/* ... */}</div>;
}
```

## TypeScript Support

### Type Inference

```typescript
interface Store {
  count: number;
  text: string;
  increment: () => void;
}

const useStore = createShallowStore<Store>(...);

// Fully typed
const count = useStore((state) => state.count); // number
const text = useStore((state) => state.text);   // string

// Actions are typed
const increment = useStore((state) => state.increment); // () => void
```

### Generic Stores

```typescript
function createCRUDStore<T extends { id: string }>() {
  return createShallowStore<{
    items: T[];
    add: (item: T) => void;
    remove: (id: string) => void;
  }>((set) => ({
    items: [],
    add: (item) => set((state) => ({
      items: [...state.items, item]
    })),
    remove: (id) => set((state) => ({
      items: state.items.filter(item => item.id !== id)
    })),
  }));
}

// Type-safe CRUD store for any entity
const useUserStore = createCRUDStore<User>();
const usePostStore = createCRUDStore<Post>();
```

## Comparison with Plain Zustand

### Plain Zustand

```typescript
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

const useStore = create<Store>((set) => ({
  count: 0,
  text: '',
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Need to specify shallow manually
function Component() {
  const { count, text } = useStore(
    (state) => ({ count: state.count, text: state.text }),
    shallow // Must remember this!
  );
}
```

### With Toolkit

```typescript
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

const useStore = createShallowStore<Store>((set) => ({
  count: 0,
  text: '',
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Shallow comparison is automatic!
function Component() {
  const { count, text } = useStore((state) => ({
    count: state.count,
    text: state.text
  }));
  // No shallow needed - automatic!
}
```

## Advanced Features

### Middleware Support

```typescript
import { devtools, persist } from 'zustand/middleware';
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

const useStore = createShallowStore<Store>(
  devtools(
    persist(
      (set) => ({
        // Store implementation
      }),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

### Access Store API

```typescript
const toolkit = createStoreToolkit<Store>(...);

// Use hook
toolkit.useStore((state) => state.count);

// Direct API access
toolkit.api.getState().increment();
toolkit.api.subscribe((state) => console.log(state));
```

## Best Practices

1. **Use shallow stores** - Default to `createShallowStore`
2. **Use providers for SSR** - Isolated state per request
3. **Split into slices** - Multiple focused stores vs one giant store
4. **Type everything** - Full TypeScript for safety
5. **Avoid over-selecting** - Select only what you need

## Related

- [React Action Guard](/packages/react-action-guard/) - Uses this toolkit internally
- [Zustand](https://zustand-demo.pmnd.rs/) - The underlying state library

## License

MIT © Oleksii Kyrychenko
