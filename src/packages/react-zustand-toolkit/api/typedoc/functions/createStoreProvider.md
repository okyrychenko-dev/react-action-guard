[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / createStoreProvider

# Function: createStoreProvider()

> **createStoreProvider**\<`TState`, `TMutators`\>(`storeCreator`, `contextName`): [`StoreProviderResult`](../interfaces/StoreProviderResult.md)\<`TState`\>

Defined in: [providers/createStoreProvider.tsx:170](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/providers/createStoreProvider.tsx#L170)

Creates a React Context provider for isolated Zustand store instances.

This utility creates a React Context provider that wraps a Zustand store, allowing
each provider instance to have its own isolated store. This is essential for:
- **Server-Side Rendering**: Each request gets its own store instance
- **Testing**: No shared state between test runs
- **Micro-frontends**: Isolated state per application instance
- **Multiple instances**: Same component tree with independent state

The provider creates isolated store instances and exposes hooks for accessing
the store from components within the provider tree.

Returns an object with:
- `Provider`: React component to wrap your app
- `useContext`: Hook to get the store API
- `useContextStore`: Hook to select values from store (with shallow comparison)
- `useIsInsideProvider`: Hook to check if inside provider
- `useOptionalContext`: Hook that returns null if outside provider

## Type Parameters

### TState

`TState`

The shape of your store state and actions

### TMutators

`TMutators` *extends* \[keyof `StoreMutators`\<`TState`, `TState`\>, `unknown`\][] = \[\]

Array of mutators (middleware) applied to the store (default: [])

## Parameters

### storeCreator

[`MutatorsStateCreator`](../type-aliases/MutatorsStateCreator.md)\<`TState`, `TMutators`\>

Function that creates the store state and actions

### contextName

`string` = `"Store"`

Optional name for better debugging (default: 'Store')
                     Used in React DevTools and error messages

## Returns

[`StoreProviderResult`](../interfaces/StoreProviderResult.md)\<`TState`\>

Object with Provider component and hooks to access the context store

## Examples

Basic usage with provider
```tsx
import { createStoreProvider } from '@okyrychenko-dev/react-zustand-toolkit';

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
}

const { Provider: TodoProvider, useContextStore: useTodoStore } = 
  createStoreProvider<TodoState>(
    (set) => ({
      todos: [],
      addTodo: (text) => set((state) => ({
        todos: [...state.todos, { id: Date.now().toString(), text }]
      })),
      removeTodo: (id) => set((state) => ({
        todos: state.todos.filter(t => t.id !== id)
      })),
    }),
    'Todo'
  );

// Wrap your app
function App() {
  return (
    <TodoProvider>
      <TodoList />
      <AddTodo />
    </TodoProvider>
  );
}

// Use in components
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  return <ul>{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>;
}
```

Multiple independent instances
```tsx
const { Provider: CounterProvider, useContextStore } = 
  createStoreProvider<CounterState>(..., 'Counter');

function App() {
  return (
    <div>
      <CounterProvider>
        <Counter title="Counter 1" />
      </CounterProvider>
      
      <CounterProvider>
        <Counter title="Counter 2" />
      </CounterProvider>
    </div>
  );
}

// Each Counter has its own isolated state
function Counter({ title }) {
  const { count, increment } = useContextStore();
  return <div>{title}: {count} <button onClick={increment}>+</button></div>;
}
```

With lifecycle hooks
```tsx
const { Provider, useContextStore } = createStoreProvider<AppState>(
  (set) => ({
    // ... state
  }),
  'AppStore'
);

function App() {
  return (
    <Provider
      onStoreInit={(store) => {
        // Pure synchronous initialization
        console.log('Initial snapshot:', store.getState());
      }}
      onStoreReady={(store) => {
        // Post-commit side effects
        store.subscribe((state) => {
          console.log('Store updated:', state);
        });
      }}
    >
      <MyApp />
    </Provider>
  );
}
```

Conditional rendering based on provider existence
```tsx
const { Provider, useContextStore, useIsInsideProvider } = 
  createStoreProvider<SettingsState>(..., 'Settings');

function SettingsButton() {
  const isInsideSettingsProvider = useIsInsideProvider();
  
  if (!isInsideSettingsProvider) {
    return null; // Don't render if not inside provider
  }
  
  return <button>Settings</button>;
}
```

## See

 - [createShallowStore](createShallowStore.md) for creating a global store
 - [Zustand documentation](https://github.com/pmndrs/zustand)

## Since

0.6.0
