[**React Zustand Toolkit API v0.1.1**](../README.md)

***

[React Zustand Toolkit API](../README.md) / createShallowStore

# Function: createShallowStore()

> **createShallowStore**\<`TState`, `TMutators`\>(`storeCreator`): [`ShallowStoreBindings`](../interfaces/ShallowStoreBindings.md)\<`TState`\>

Defined in: [core/createShallowStore.ts:131](https://github.com/okyrychenko-dev/react-zustand-toolkit/blob/main/src/core/createShallowStore.ts#L131)

Creates a Zustand store with automatic shallow comparison for all selectors.

This utility wraps Zustand's `createStore` and returns a hook that automatically
uses shallow comparison for all selectors. This prevents unnecessary re-renders when
selecting multiple values from the store, as it only re-renders when the actual
values change, not when the reference changes.

Without shallow comparison, selecting multiple values like `{ count, name }` would
cause a re-render on every store update because the object reference changes.
With shallow comparison, it only re-renders when `count` or `name` actually change.

The returned hook has two signatures:
- `useStore()` - Returns the entire store state
- `useStore(selector)` - Returns the selected value(s) with shallow comparison

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

## Returns

[`ShallowStoreBindings`](../interfaces/ShallowStoreBindings.md)\<`TState`\>

Object with two properties:
         - `useStore`: Hook to access store with shallow comparison
         - `useStoreApi`: Direct access to the store API for imperative usage

## Examples

Basic counter store with shallow comparison
```tsx
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

interface CounterState {
  count: number;
  name: string;
  increment: () => void;
  decrement: () => void;
  setName: (name: string) => void;
}

const { useStore: useCounterStore } = createShallowStore<CounterState>((set) => ({
  count: 0,
  name: 'Counter',
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setName: (name) => set({ name }),
}));

// Component only re-renders when count or name changes
function Counter() {
  const { count, increment } = useCounterStore((state) => ({
    count: state.count,
    increment: state.increment,
  }));
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

With DevTools middleware
```tsx
import { devtools } from 'zustand/middleware';
import { createShallowStore } from '@okyrychenko-dev/react-zustand-toolkit';

const { useStore: useStore } = createShallowStore(
  devtools(
    (set) => ({
      bears: 0,
      increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
      removeAllBears: () => set({ bears: 0 }),
    }),
    { name: 'BearsStore' }
  )
);
```

Accessing entire state
```tsx
function Dashboard() {
  // Gets entire state with shallow comparison
  const state = useCounterStore();
  
  return (
    <div>
      <h1>{state.name}</h1>
      <p>Count: {state.count}</p>
      <button onClick={state.increment}>Increment</button>
    </div>
  );
}
```

Using store API for imperative access
```tsx
const { useStore, useStoreApi } = createShallowStore<CounterState>(...);

function ExternalButton() {
  const storeApi = useStoreApi();
  
  const handleClick = () => {
    // Direct imperative access without hook
    const currentCount = storeApi.getState().count;
    console.log('Current count:', currentCount);
    
    // Directly mutate
    storeApi.setState({ count: currentCount + 10 });
  };
  
  return <button onClick={handleClick}>Add 10</button>;
}
```

## See

 - [Zustand documentation](https://github.com/pmndrs/zustand)
 - [createStoreProvider](createStoreProvider.md) for creating a store with React Context provider
 - [createStoreToolkit](createStoreToolkit.md) for advanced store utilities

## Since

0.6.0
