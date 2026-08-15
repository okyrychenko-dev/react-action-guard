# React Action Guard DevTools

> Developer tools for visualizing, debugging, and monitoring UI blocking events in real-time

## What is DevTools?

React Action Guard DevTools provides a visual interface for debugging blocking states in your application. See exactly what's blocking, when, and why - all in real-time.

## Features

- **📊 Real-time Timeline** - Visual timeline of all blocking events
- **🎯 Active Blockers View** - See what's currently blocking
- **🔍 Event Filtering** - Filter by blocker ID, scope, or reason
- **⏸️ Pause/Resume** - Freeze timeline to inspect specific moments
- **📝 Detailed Info** - Full configuration and context for each event
- **🎨 Clean UI** - Minimal interface that doesn't interfere
- **⌨️ Keyboard Shortcuts** - Quick navigation and control
- **🔒 Production Safe** - Auto-disabled in production

## Installation

```bash
npm install -D @okyrychenko-dev/react-action-guard-devtools
```

**Peer Dependencies:**
- `@okyrychenko-dev/react-action-guard` ^0.6.0
- `react` ^17.0.0 || ^18.0.0 || ^19.0.0

## Quick Start

```tsx
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

function App() {
  return (
    <>
      <YourApp />
      
      {/* Add DevTools - auto-disabled in production */}
      <ActionGuardDevtools />
    </>
  );
}
```

That's it! The DevTools will appear in the bottom-right corner.

## Component API

### ActionGuardDevtools

```typescript
interface ActionGuardDevtoolsProps {
  position?: 'left' | 'right';  // Default: 'right'
  defaultOpen?: boolean;         // Default: false
  maxEvents?: number;            // Default: 200
  showInProduction?: boolean;    // Default: false
  store?: UIBlockingStoreApi;    // For custom stores
}
```

**Examples:**

```tsx
// Left side, start open
<ActionGuardDevtools position="left" defaultOpen={true} />

// More event history
<ActionGuardDevtools maxEvents={500} />

// With UIBlockingProvider
function DevtoolsWithProvider() {
  const store = useUIBlockingContext();
  return <ActionGuardDevtools store={store} />;
}
```

## UI Features

### Timeline View

Shows chronological list of all blocking events:

- **🟢 Green** - "add" events (blocker activated)
- **🔴 Red** - "remove" events (blocker deactivated)
- **🔵 Blue** - "update" events (configuration changed)
- **🟠 Orange** - "timeout" / "cancel" events (auto-removed)

Each event shows:
- Blocker ID
- Action type
- Timestamp
- Duration (for completed blockers)
- Scope tags
- Expandable details

### Active Blockers Panel

Real-time view of currently active blockers:
- Sorted by priority (highest first)
- Shows scope, reason, priority
- Time since activation
- Quick identification of what's blocking now

### Search & Filtering

**Search Box:**
- Filter by blocker ID
- Filter by reason text
- Filter by scope

**Advanced** (via store API):
- Filter by action type
- Filter by priority range
- Filter by time range

### Controls

- **🔍 Search** - Quick filter events
- **⏸️ Pause** - Stop recording new events
- **▶️ Resume** - Continue recording
- **🗑️ Clear** - Remove all events from history
- **➖ Minimize** - Collapse to show just active count
- **✖️ Close** - Hide DevTools completely

### Keyboard Shortcuts

When panel is open (focus not in input):
- `Esc` - Close panel
- `Space` - Pause/Resume recording
- `C` -Clear all events

## Usage Patterns

### Basic Usage (Recommended)

```tsx
function App() {
  return (
    <>
      <YourApp />
      {/* No environment check needed - auto-disabled in production */}
      <ActionGuardDevtools />
    </>
  );
}
```

::: tip No Environment Check Needed
The component automatically returns `null` in production, so you don't need to wrap it in `process.env.NODE_ENV` checks. This simplifies your code while still keeping DevTools out of production bundles (when using tree-shaking).
:::

### With Tree-Shaking (Optional)

If you want to completely remove DevTools from your production bundle:

```tsx
function App() {
  return (
    <>
      <YourApp />
      {/* Tree-shaking: DevTools code won't be in production bundle */}
      {process.env.NODE_ENV === 'development' && <ActionGuardDevtools />}
    </>
  );
}
```

### With Feature Flag

```tsx
function App() {
  const showDevtools = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('debug') === 'true';
  
  return (
    <>
      <YourApp />
      {showDevtools && <ActionGuardDevtools />}
    </>
  );
}
```

###  With Provider

```tsx
import { UIBlockingProvider, useUIBlockingContext } from '@okyrychenko-dev/react-action-guard';
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

function DevtoolsWrapper() {
  const store = useUIBlockingContext();
  return <ActionGuardDevtools store={store} />;
}

function App() {
  return (
    <UIBlockingProvider>
      <YourApp />
      <DevtoolsWrapper />
    </UIBlockingProvider>
  );
}
```

## Advanced Usage

### Accessing DevTools Store

```tsx
import { useDevtoolsStore } from '@okyrychenko-dev/react-action-guard-devtools';

function CustomDevtoolsUI() {
  const { events, isOpen, toggleOpen, clearEvents } = useDevtoolsStore();
  
  return (
    <div>
      <button onClick={toggleOpen}>Toggle Devtools</button>
      <button onClick={clearEvents}>Clear</button>
      <p>Events: {events.length}</p>
    </div>
  );
}
```

### Store Selectors

```tsx
import { 
  useDevtoolsStore, 
  selectFilteredEvents,
  selectUniqueScopes 
} from '@okyrychenko-dev/react-action-guard-devtools';

function EventStats() {
  const filteredEvents = useDevtoolsStore(selectFilteredEvents);
  const uniqueScopes = useDevtoolsStore(selectUniqueScopes);
  
  return (
    <div>
      <p>Filtered Events: {filteredEvents.length}</p>
      <p>Unique Scopes: {uniqueScopes.join(', ')}</p>
    </div>
  );
}
```

### Manual Middleware Registration

```tsx
import { 
  createDevtoolsMiddleware,
  DEVTOOLS_MIDDLEWARE_NAME 
} from '@okyrychenko-dev/react-action-guard-devtools';
import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';

// Register manually
const middleware = createDevtoolsMiddleware();
uiBlockingStoreApi.getState().registerMiddleware(
  DEVTOOLS_MIDDLEWARE_NAME,
  middleware
);

// Unregister
uiBlockingStoreApi.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
```

## Troubleshooting

### DevTools Not Appearing

**Check:**
1. Component is rendered
2. Not in production (unless `showInProduction={true}`)
3. No CSS conflicts hiding the toggle button
4. No JavaScript errors in console

### Events Not Showing

**Check:**
1. Blockers are actually being added/removed
2. DevTools is not paused
3. Search filter is not hiding events
4. `maxEvents` limit not reached

### Performance Issues

**Solutions:**  
1. Reduce `maxEvents` (default: 200)
2. Clear events periodically
3. Disable in production
4. Use filtering to reduce rendered events

## Best Practices

1. **Development Only** - Don't ship to production
2. **Clear Regularly** - Don't let event history grow too large
3. **Use Filtering** - Focus on relevant events
4. **Pause for Inspection** - Freeze timeline to analyze
5. **Check Active Blockers** - Most important view

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  DevtoolsEvent,
  DevtoolsFilter,
  DevtoolsPosition,
  DevtoolsState,
  DevtoolsActions,
} from '@okyrychenko-dev/react-action-guard-devtools';
```

## Related

- [React Action Guard](/packages/react-action-guard/) - Core library
- [Middleware System](/packages/react-action-guard/guides/middleware-system) - How DevTools hooks in

## License

MIT © Oleksii Kyrychenko
