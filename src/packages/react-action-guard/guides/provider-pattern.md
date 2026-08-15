# Provider Pattern Guide

Learn how to use isolated store instances for SSR, testing, and micro-frontends.

## What is the Provider Pattern?

By default, React Action Guard uses a **global singleton store** shared across your entire application. The provider pattern allows you to create **isolated store instances** with independent state.

## Why Use Providers?

### 1. Server-Side Rendering (SSR)

Each request needs its own isolated state:

```tsx
// app/layout.tsx (Next.js App Router)
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Each request gets fresh store */}
        <UIBlockingProvider>
          {children}
        </UIBlockingProvider>
      </body>
    </html>
  );
}
```

**Without Provider:** All requests share the same store (state leaks between users!)  
**With Provider:** Each request has isolated state (safe and clean)

### 2. Testing

No need to manually cleanup between tests:

```tsx
import { render } from '@testing-library/react';
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <UIBlockingProvider>
      {ui}
    </UIBlockingProvider>
  );
}

test('blocker behaves correctly', () => {
  const { rerender } = renderWithProvider(<MyComponent />);
  // Fresh store for this test
  // No cleanup needed!
});

test('another test', () => {
  renderWithProvider(<AnotherComponent />);
  // Fresh store again
});
```

### 3. Micro-Frontends

Each micro-frontend gets independent state:

```tsx
// Micro-Frontend A
function MicroAppA() {
  return (
    <UIBlockingProvider>
      <AppA />
    </UIBlockingProvider>
  );
}

// Micro-Frontend B
function MicroAppB() {
  return (
    <UIBlockingProvider>
      <AppB />
    </UIBlockingProvider>
  );
}

// They don't interfere with each other!
```

### 4. Component Libraries

Prevent conflicts with host applications:

```tsx
// Your component library
export function MyLibraryComponent() {
  return (
    <UIBlockingProvider>
      {/* Library has its own isolated blocking state */}
      <LibraryContent />
    </UIBlockingProvider>
  );
}
```

## Basic Usage

### Setup Provider

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

### Hooks Work Automatically

All hooks automatically use the provider store when available:

```tsx
function MyComponent() {
  // These hooks will use the provider store (not global)
  const isBlocked = useIsBlocked('form');
  useBlocker('save', { scope: 'form' }, isSaving);
  
  return <div>Content</div>;
}
```

**Smart Resolution:**
1. Hooks check for provider store first
2. If no provider, fall back to global store
3. Same code works with or without provider!

## Provider Props

```tsx
interface UIBlockingProviderProps {
  children: ReactNode;
  middlewares?: Middleware[];    // Initial middlewares
}
```

### middlewares

Register middlewares for this provider:

```tsx
import { loggerMiddleware, createAnalyticsMiddleware } from '@okyrychenko-dev/react-action-guard';

<UIBlockingProvider
  middlewares={[
    loggerMiddleware,
    createAnalyticsMiddleware({ provider: 'ga' }),
  ]}
>
  <App />
</UIBlockingProvider>
```

**Note:** These middlewares only apply to this provider's store, not the global store.

Provider lifecycle hooks come from `react-zustand-toolkit` and stay internal to `UIBlockingProvider`.
If you need Redux DevTools, connect them at the Zustand store creator level rather than through provider props.

## Context Hooks

### useUIBlockingContext

Get the store API from context (throws if no provider):

```tsx
import { useUIBlockingContext } from '@okyrychenko-dev/react-action-guard';

function MyComponent() {
  const store = useUIBlockingContext();
  
  // Now you have direct store access
  const handleClick = () => {
    store.getState().addBlocker('custom', { scope: 'global' });
  };
  
  return <button onClick={handleClick}>Add Blocker</button>;
}
```

**When to use:**
- Need direct store access
- Custom integrations
- Advanced use cases

### useIsInsideUIBlockingProvider

Check if inside a provider:

```tsx
import { useIsInsideUIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

function MyComponent() {
  const hasProvider = useIsInsideUIBlockingProvider();
  
  return (
    <div>
      {hasProvider ? 'Using provider store' : 'Using global store'}
    </div>
  );
}
```

**Use cases:**
- Conditional logic based on provider presence
- Warning users about missing provider
- Library components adapting to environment

### useUIBlockingStoreFromContext

Select state from context store:

```tsx
import { useUIBlockingStoreFromContext } from '@okyrychenko-dev/react-action-guard';

function MyComponent() {
  const isBlocked = useUIBlockingStoreFromContext(
    (state) => state.isBlocked('form')
  );
  
  return <div>Blocked: {isBlocked}</div>;
}
```

## Patterns

### Pattern 1: SSR with Next.js

```tsx
// app/providers.tsx
'use client';

import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIBlockingProvider>
      {children}
    </UIBlockingProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Pattern 2: Testing Setup

```tsx
// test-utils.tsx
import { render } from '@testing-library/react';
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';

export function renderWithProvider(
  ui: React.ReactElement,
  options?: {
    middlewares?: Middleware[];
  }
) {
  return render(
    <UIBlockingProvider middlewares={options?.middlewares}>
      {ui}
    </UIBlockingProvider>
  );
}

// my-component.test.tsx
import { renderWithProvider } from './test-utils';

test('component works', () => {
  const { getByText } = renderWithProvider(<MyComponent />);
  // Test with isolated store
});
```

### Pattern 3: Nested Providers

```tsx
function App() {
  return (
    <UIBlockingProvider>
      <MainContent />
      
      {/* Nested provider for modal */}
      <Modal>
        <UIBlockingProvider>
          <ModalContent />
        </UIBlockingProvider>
      </Modal>
    </UIBlockingProvider>
  );
}
```

**Behavior:** Hooks inside `ModalContent` use the modal's store, not the app's store.

### Pattern 4: Conditional Provider

```tsx
function App() {
  const needsProvider = isSSR() || isTest();
  
  const content = <YourApp />;
  
  return needsProvider ? (
    <UIBlockingProvider>
      {content}
    </UIBlockingProvider>
  ) : (
    content // Use global store
  );
}
```

### Pattern 5: Provider with Initial State

```tsx
function App() {
  return (
    <UIBlockingProvider
      onStoreCreate={(store) => {
        // Restore saved state
        const saved = localStorage.getItem('blockers');
        if (saved) {
          const blockers = JSON.parse(saved);
          blockers.forEach((blocker: any) => {
            store.getState().addBlocker(blocker.id, blocker.config);
          });
        }
      }}
    >
      <YourApp />
    </UIBlockingProvider>
  );
}
```

## Global Store vs Provider Store

### When to Use Global Store

✅ Simple single-page apps  
✅ No SSR  
✅ Single instance per browser tab  
✅ Want simplest setup  

```tsx
// No provider needed
function App() {
  return <YourApp />;
}
```

### When to Use Provider

✅ Server-side rendering  
✅ Testing (isolated state per test)  
✅ Micro-frontends  
✅ Component libraries  
✅ Multiple independent instances  

```tsx
// Provider for isolation
function App() {
  return (
    <UIBlockingProvider>
      <YourApp />
    </UIBlockingProvider>
  );
}
```

## Migration Guide

### From Global to Provider

Before:
```tsx
// App uses global store
function App() {
  return <YourApp />;
}

// Hooks use global store
function Component() {
  useBlocker('id', { scope: 'form' });
}
```

After:
```tsx
// Wrap in provider
function App() {
  return (
    <UIBlockingProvider>
      <YourApp />
    </UIBlockingProvider>
  );
}

// Hooks automatically use provider store
function Component() {
  useBlocker('id', { scope: 'form' }); // Same code!
}
```

**No code changes needed in components!** Hooks automatically detect and use the provider.

## Troubleshooting

### "Cannot find store in context"

**Problem:** Hook called outside provider.

**Solution:**
```tsx
// ❌ Bad: Hook outside provider
function App() {
  useBlocker('id', config); // Error!
  
  return (
    <UIBlockingProvider>
      <Content />
    </UIBlockingProvider>
  );
}

// ✅ Good: Hook inside provider
function App() {
  return (
    <UIBlockingProvider>
      <Content />
    </UIBlockingProvider>
  );
}

function Content() {
  useBlocker('id', config); // Works!
}
```

### Provider Not Isolating State

**Problem:** Multiple providers seem to share state.

**Solution:** Check that you're not accidentally using `uiBlockingStoreApi` (global store):

```tsx
// ❌ Bad: Using global store API
function Component() {
  const store = uiBlockingStoreApi; // Always global!
}

// ✅ Good: Using context
function Component() {
  const store = useUIBlockingContext(); // Provider store
}
```

### DevTools Showing Multiple Instances

This is expected when using multiple providers. Give each a unique name:

```tsx
<UIBlockingProvider>
  <MainApp />
</UIBlockingProvider>

<UIBlockingProvider>
  <ModalApp />
</UIBlockingProvider>
```

## Best Practices

1. **Use provider for SSR** - Always wrap SSR apps in provider
2. **Use provider for tests** - Isolated state per test
3. **Don't over-nest** - Usually one provider per app is enough
4. **Keep providers focused** - Use providers for isolated state, not runtime DevTools wiring
5. **Initialize carefully** - Use `onStoreCreate` for setup logic

## Next Steps

- [Architecture: Provider Pattern](../architecture#provider-pattern) - Implementation details
- [API Reference: Context Hooks](../api/hooks) - Hook documentation
- [Guides: Testing](./testing) - Testing with providers
- [Examples: SSR](../examples/ssr) - SSR examples
