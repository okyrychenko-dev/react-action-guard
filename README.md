# @okyrychenko-dev/react-action-guard

> Elegant UI blocking management for React applications with priorities, scopes, and automatic cleanup

## Features

- Priority-based blocking system
- Scoped blocking (global, specific areas, or multiple scopes)
- Automatic cleanup on unmount
- TypeScript support
- Built on Zustand for efficient state management
- Hooks-based API

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

## Quick Start

```jsx
import { useBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";

function MyComponent() {
  const isBlocked = useIsBlocked("my-scope");

  return <button disabled={isBlocked}>Click me</button>;
}
```

## API Reference

### Hooks

#### `useBlocker(blockerId, config, isActive)`

Automatically adds a blocker when the component mounts and removes it on unmount.

**Parameters:**

- `blockerId: string` - Unique identifier for the blocker
- `config: BlockerConfig` - Configuration object
  - `scope?: string | string[]` - Scope(s) to block (default: "global")
  - `reason?: string` - Reason for blocking (for debugging)
  - `priority?: number` - Priority level (higher = more important)
- `isActive?: boolean` - Whether the blocker is active (default: true)

**Example:**

```jsx
function MyComponent() {
  useBlocker("my-blocker", {
    scope: "form",
    reason: "Form is saving",
    priority: 10,
  });

  return <div>Content</div>;
}
```

#### `useIsBlocked(scope)`

Checks if a specific scope (or scopes) is currently blocked.

**Parameters:**

- `scope?: string | string[]` - Scope(s) to check (default: "global")

**Returns:** `boolean` - Whether the scope is blocked

**Example:**

```jsx
function SubmitButton() {
  const isFormBlocked = useIsBlocked("form");

  return <button disabled={isFormBlocked}>Submit</button>;
}
```

#### `useAsyncAction(actionId, scope)`

Wraps an async function with automatic blocking/unblocking.

**Parameters:**

- `actionId: string` - Identifier for the action
- `scope?: string | string[]` - Scope(s) to block during execution

**Returns:** `(asyncFn: () => Promise<T>) => Promise<T>` - Function wrapper

**Example:**

```jsx
function MyComponent() {
  const executeWithBlocking = useAsyncAction("save-data", "form");

  const handleSave = async () => {
    await executeWithBlocking(async () => {
      await saveData();
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Store

#### `useUIBlockingStore`

Direct access to the Zustand store for advanced use cases.

**Methods:**

- `addBlocker(id, config)` - Manually add a blocker
- `removeBlocker(id)` - Manually remove a blocker
- `isBlocked(scope)` - Check if scope is blocked
- `getBlockingInfo(scope)` - Get detailed blocking information
- `clearAllBlockers()` - Remove all blockers
- `clearBlockersForScope(scope)` - Remove blockers for specific scope

**Example:**

```jsx
import { useUIBlockingStore } from "@okyrychenko-dev/react-action-guard";

function AdvancedComponent() {
  const { addBlocker, removeBlocker } = useUIBlockingStore();

  const startBlocking = () => {
    addBlocker("custom-blocker", {
      scope: ["form", "navigation"],
      reason: "Critical operation in progress",
      priority: 100,
    });
  };

  const stopBlocking = () => {
    removeBlocker("custom-blocker");
  };

  return (
    <div>
      <button onClick={startBlocking}>Start</button>
      <button onClick={stopBlocking}>Stop</button>
    </div>
  );
}
```

## TypeScript

The package is written in TypeScript and includes full type definitions.

```typescript
import type { BlockerConfig, BlockerInfo, UIBlockingState } from "@okyrychenko-dev/react-action-guard";
```

## Use Cases

### Loading States

```jsx
function DataLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useBlocker(
    "data-loader",
    {
      scope: "content",
      reason: "Loading data",
    },
    isLoading
  );

  // ... rest of component
}
```

### Form Submission

```jsx
function UserForm() {
  const executeWithBlocking = useAsyncAction("submit-form", "form");
  const isBlocked = useIsBlocked("form");

  const handleSubmit = async (data) => {
    await executeWithBlocking(async () => {
      await submitForm(data);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input disabled={isBlocked} />
      <button disabled={isBlocked}>Submit</button>
    </form>
  );
}
```

### Global Loading Overlay

```jsx
function App() {
  const isGloballyBlocked = useIsBlocked("global");

  return (
    <div>
      {isGloballyBlocked && <LoadingOverlay />}
      <YourApp />
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Type checking
npm run typecheck

# Watch mode for development
npm run dev
```

## License

MIT © Olexii Kyrychenko
