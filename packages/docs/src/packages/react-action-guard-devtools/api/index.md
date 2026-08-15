# DevTools API Reference

Complete API documentation for React Action Guard DevTools.

## Components

### ActionGuardDevtools

Main DevTools component that displays the debugging panel.

```typescript
function ActionGuardDevtools(props: ActionGuardDevtoolsProps): ReactElement;
```

**Props:**

| Prop               | Type                 | Default      | Description                          |
| ------------------ | -------------------- | ------------ | ------------------------------------ |
| `position`         | `'left' \| 'right'`  | `'right'`    | Position of the panel                |
| `defaultOpen`      | `boolean`            | `false`      | Whether panel starts open            |
| `maxEvents`        | `number`             | `200`        | Maximum events to keep in history    |
| `showInProduction` | `boolean`            | `false`      | Show in production (not recommended) |
| `store`            | `UIBlockingStoreApi` | global store | Custom store instance                |

**Examples:**

```tsx
// Basic usage
<ActionGuardDevtools />

// Left side, start open
<ActionGuardDevtools position="left" defaultOpen={true} />

// More event history
<ActionGuardDevtools maxEvents={500} />

// With custom store (for providers)
function DevtoolsWrapper() {
  const store = useUIBlockingContext();
  return <ActionGuardDevtools store={store} />;
}
```

**Behavior:**

- Automatically disabled in production unless `showInProduction={true}`
- Registers middleware with the blocking store
- Displays toggle button in corner when closed
- Panel can be opened/closed, minimized, or detached

---

## Hooks

### useDevtoolsStore

Access the DevTools internal store.

```typescript
function useDevtoolsStore<T>(
  selector: (state: DevtoolsStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
```

**DevtoolsStore Interface:**

```typescript
interface DevtoolsStore {
  // State
  events: DevtoolsEvent[];
  isOpen: boolean;
  isMinimized: boolean;
  isPaused: boolean;
  filter: DevtoolsFilter;

  // Actions
  addEvent: (event: DevtoolsEvent) => void;
  clearEvents: () => void;
  toggleOpen: () => void;
  toggleMinimized: () => void;
  togglePaused: () => void;
  setFilter: (filter: Partial<DevtoolsFilter>) => void;
}
```

**Examples:**

```tsx
// Get events
const events = useDevtoolsStore((state) => state.events);

// Check if open
const isOpen = useDevtoolsStore((state) => state.isOpen);

// Get filtered events
const filteredEvents = useDevtoolsStore(selectFilteredEvents);

// Access multiple values
const { isOpen, isPaused } = useDevtoolsStore((state) => ({
  isOpen: state.isOpen,
  isPaused: state.isPaused,
}));
```

---

### useDevtoolsActions

Get DevTools actions without subscribing to state.

```typescript
function useDevtoolsActions(): DevtoolsActions;
```

**Returns:**

```typescript
interface DevtoolsActions {
  clearEvents: () => void;
  toggleOpen: () => void;
  toggleMinimized: () => void;
  togglePaused: () => void;
  setFilter: (filter: Partial<DevtoolsFilter>) => void;
}
```

**Examples:**

```tsx
function CustomDevtoolsControls() {
  const { toggleOpen, clearEvents } = useDevtoolsActions();

  return (
    <div>
      <button onClick={toggleOpen}>Toggle DevTools</button>
      <button onClick={clearEvents}>Clear History</button>
    </div>
  );
}
```

---

## Selectors

Pre-built selectors for common queries.

### selectFilteredEvents

Get events matching current filter.

```typescript
function selectFilteredEvents(state: DevtoolsStore): DevtoolsEvent[];
```

**Example:**

```tsx
const filteredEvents = useDevtoolsStore(selectFilteredEvents);
```

---

### selectActiveBlockers

Get currently active blockers from events.

```typescript
function selectActiveBlockers(state: DevtoolsStore): ActiveBlocker[];
```

**Example:**

```tsx
const activeBlockers = useDevtoolsStore(selectActiveBlockers);

return (
  <div>
    {activeBlockers.map((blocker) => (
      <div key={blocker.id}>
        {blocker.reason} (Priority: {blocker.priority})
      </div>
    ))}
  </div>
);
```

---

### selectUniqueScopes

Get list of all unique scopes from events.

```typescript
function selectUniqueScopes(state: DevtoolsStore): string[];
```

**Example:**

```tsx
const scopes = useDevtoolsStore(selectUniqueScopes);

return (
  <select>
    <option value="">All Scopes</option>
    {scopes.map((scope) => (
      <option key={scope} value={scope}>
        {scope}
      </option>
    ))}
  </select>
);
```

---

### selectEventStats

Get statistics about events.

```typescript
function selectEventStats(state: DevtoolsStore): EventStats;

interface EventStats {
  total: number;
  byAction: Record<BlockingAction, number>;
  byScope: Record<string, number>;
  averageDuration: number;
}
```

**Example:**

```tsx
const stats = useDevtoolsStore(selectEventStats);

return (
  <div>
    <p>Total Events: {stats.total}</p>
    <p>Add Events: {stats.byAction.add}</p>
    <p>Average Duration: {stats.averageDuration}ms</p>
  </div>
);
```

---

## Types

### DevtoolsEvent

Event captured by DevTools.

```typescript
interface DevtoolsEvent {
  id: string;
  action: BlockingAction;
  blockerId: string;
  timestamp: number;
  config?: BlockerConfig;
  prevState?: BlockerConfig;
  scope?: string;
  count?: number;
  duration?: number; // For completed events
}

type BlockingAction =
  | "add"
  | "update"
  | "remove"
  | "timeout"
  | "clear"
  | "clear_scope";
```

---

### DevtoolsFilter

Filter configuration for events.

```typescript
interface DevtoolsFilter {
  searchText: string; // Filter by ID or reason
  actions: BlockingAction[]; // Filter by action types
  scopes: string[]; // Filter by scopes
  minPriority: number; // Minimum priority
  maxPriority: number; // Maximum priority
  timeRange?: {
    // Time range filter
    start: number;
    end: number;
  };
}
```

**Example:**

```tsx
const { setFilter } = useDevtoolsActions();

// Filter by search text
setFilter({ searchText: "user-form" });

// Filter by actions
setFilter({ actions: ["add", "timeout"] });

// Filter by scope
setFilter({ scopes: ["form", "checkout"] });

// Filter by priority range
setFilter({ minPriority: 50, maxPriority: 100 });

// Clear filter
setFilter({
  searchText: "",
  actions: [],
  scopes: [],
  minPriority: 0,
  maxPriority: 100,
});
```

---

### ActiveBlocker

Currently active blocker derived from events.

```typescript
interface ActiveBlocker {
  id: string;
  reason: string;
  priority: number;
  scope: string | string[];
  startTime: number;
  duration: number; // Time active in ms
}
```

---

## Middleware API

### createDevtoolsMiddleware

Create DevTools middleware instance.

```typescript
function createDevtoolsMiddleware(
  devtoolsStore?: StoreApi<DevtoolsStore>
): Middleware;
```

**Parameters:**

| Parameter       | Type                      | Description                    |
| --------------- | ------------------------- | ------------------------------ |
| `devtoolsStore` | `StoreApi<DevtoolsStore>` | Optional custom DevTools store |

**Returns:** Middleware function

**Example:**

```tsx
import {
  createDevtoolsMiddleware,
  DEVTOOLS_MIDDLEWARE_NAME,
} from "@okyrychenko-dev/react-action-guard-devtools";
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";

// Create and register middleware
const middleware = createDevtoolsMiddleware();

uiBlockingStoreApi
  .getState()
  .registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);

// Later: unregister
uiBlockingStoreApi.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
```

---

### DEVTOOLS_MIDDLEWARE_NAME

Constant name for DevTools middleware.

```typescript
const DEVTOOLS_MIDDLEWARE_NAME = "__devtools__";
```

Use this constant when manually registering/unregistering middleware.

---

## Constants

### DEFAULT_MAX_EVENTS

Default maximum events to keep.

```typescript
const DEFAULT_MAX_EVENTS = 200;
```

---

### DEFAULT_POSITION

Default panel position.

```typescript
const DEFAULT_POSITION = "right";
```

---

## Utilities

### formatDuration

Format milliseconds to human-readable duration.

```typescript
function formatDuration(ms: number): string;
```

**Examples:**

```typescript
formatDuration(500); // "500ms"
formatDuration(1500); // "1.5s"
formatDuration(65000); // "1m 5s"
formatDuration(3665000); // "1h 1m 5s"
```

---

### formatTimestamp

Format timestamp to human-readable time.

```typescript
function formatTimestamp(
  timestamp: number,
  format?: "time" | "datetime"
): string;
```

**Examples:**

```typescript
formatTimestamp(Date.now()); // "14:30:45"
formatTimestamp(Date.now(), "datetime"); // "2024-01-15 14:30:45"
```

---

## Custom DevTools UI

Build your own DevTools UI using the store and selectors:

```tsx
function CustomDevtools() {
  const events = useDevtoolsStore(selectFilteredEvents);
  const activeBlockers = useDevtoolsStore(selectActiveBlockers);
  const { clearEvents, setFilter } = useDevtoolsActions();

  return (
    <div className="custom-devtools">
      <div className="header">
        <h3>React Action Guard DevTools</h3>
        <button onClick={clearEvents}>Clear</button>
      </div>

      <div className="active-blockers">
        <h4>Active ({activeBlockers.length})</h4>
        {activeBlockers.map((blocker) => (
          <div key={blocker.id} className="blocker">
            <span className="reason">{blocker.reason}</span>
            <span className="priority">P{blocker.priority}</span>
            <span className="duration">{formatDuration(blocker.duration)}</span>
          </div>
        ))}
      </div>

      <div className="timeline">
        <h4>Timeline ({events.length})</h4>
        {events.map((event) => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

1. **Development Only**: Never ship DevTools to production
2. **Event Limit**: Use reasonable `maxEvents` (100-500)
3. **Clear Regularly**: Clear events when debugging specific issues
4. **Use Filtering**: Filter events to focus on relevant data
5. **Custom UI**: Build custom DevTools UI for specific needs

## Related

- [React Action Guard](/packages/react-action-guard/) - Core library
- [Middleware System](/packages/react-action-guard/guides/middleware-system) - How DevTools integrates
