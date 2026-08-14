# @okyrychenko-dev/react-action-guard-devtools

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-devtools.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-devtools.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Developer tools for [@okyrychenko-dev/react-action-guard](https://github.com/okyrychenko-dev/react-action-guard) - visualize, debug, and monitor UI blocking events in real-time

## Features

- 📊 **Real-time Timeline** - Visual timeline of all blocking events with duration tracking
- 🎯 **Active Blockers View** - See all currently active blockers at a glance
- 📈 **Stats View** - Aggregate counts, durations, and most frequent scopes
- 🔍 **Filtering** - Search by blocker ID, reason, or scope (advanced filters via store API)
- ⏸️ **Pause/Resume** - Pause event recording to inspect specific moments
- 📝 **Detailed Event Info** - View full configuration, duration, and state changes
- 📤 **Export** - Copy the timeline to the clipboard or download it as JSON
- ⚠️ **Stuck Detection** - Flags active blockers that outlive a configurable threshold
- 🎨 **Customizable Position** - Place devtools panel on the left or right
- 🚀 **Zero Config** - Works out of the box with automatic middleware registration
- 🔒 **Production Safe** - Automatically disabled in production builds
- 💾 **Event History** - Configurable event limit to manage memory usage
- 🗄️ **Persisted Preferences** - Minimized state, active tab, and filters survive reloads
- 🎨 **Clean UI** - Minimalistic design that doesn't interfere with your app

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-devtools
# or
yarn add @okyrychenko-dev/react-action-guard-devtools
# or
pnpm add @okyrychenko-dev/react-action-guard-devtools
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://github.com/okyrychenko-dev/react-action-guard) ^1.0.5
- [React](https://react.dev/) ^18.0.0 || ^19.0.0
- [Zustand](https://zustand-demo.pmnd.rs/) ^5.0.0

## Quick Start

Add the devtools component to your app root, and import the stylesheet once (e.g. in your entry file):

```jsx
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";
// Import the styles once, anywhere in your app (entry file recommended):
import "@okyrychenko-dev/react-action-guard-devtools/styles.css";

function App() {
  return (
    <>
      <YourApp />
      <ActionGuardDevtools />
    </>
  );
}
```

That's it! The devtools will automatically register middleware and start tracking all blocking events.

> **Note:** Styles ship as a separate stylesheet
> (`@okyrychenko-dev/react-action-guard-devtools/styles.css`) rather than being injected at
> runtime, to stay SSR-safe. Without this import the panel works but is unstyled.

## Component API

### `<ActionGuardDevtools />`

The main devtools component that renders the toggle button and panel.

#### Props

| Prop               | Type                 | Default     | Description                                                    |
| ------------------ | -------------------- | ----------- | -------------------------------------------------------------- |
| `position`         | `DevtoolsPosition`   | `"right"`   | Position of the toggle button and panel                        |
| `defaultOpen`      | `boolean`            | `false`     | Whether the panel is open by default                           |
| `maxEvents`        | `number`             | `200`       | Maximum number of events to store in history                   |
| `stuckThresholdMs` | `number`             | `10000`     | Age (ms) after which an active blocker is flagged as stuck     |
| `showInProduction` | `boolean`            | `false`     | Whether to show devtools in production                         |
| `store`            | `UIBlockingStoreApi` | `undefined` | Blocking store to observe instead of the global store          |

#### Position Options

- `"left"` - Left side
- `"right"` - Right side

#### Examples

**Custom Position and Max Events:**

```jsx
<ActionGuardDevtools position="right" maxEvents={500} />
```

**Open by Default (Development):**

```jsx
<ActionGuardDevtools defaultOpen={true} position="left" />
```

**Enable in Production (Not Recommended):**

```jsx
<ActionGuardDevtools showInProduction={true} />
```

**With UIBlockingProvider:**

```jsx
import { UIBlockingProvider, useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";

function DevtoolsWithProvider() {
  const store = useUIBlockingContext();
  return <ActionGuardDevtools store={store} />;
}

function App() {
  return (
    <UIBlockingProvider>
      <YourApp />
      <DevtoolsWithProvider />
    </UIBlockingProvider>
  );
}
```

`store` changes which blocking store is observed and where middleware is registered.
Devtools panel state and event history remain shared inside the devtools package.
Multiple devtools instances can safely observe the same store: they share one middleware
registration, so events are not duplicated and the middleware remains active until the last
instance unmounts.

## Advanced Usage

### Manual Middleware Registration

If you need more control, you can register the middleware manually:

```jsx
import {
  createDevtoolsMiddleware,
  DEVTOOLS_MIDDLEWARE_NAME,
} from "@okyrychenko-dev/react-action-guard-devtools";
import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";

// Register middleware
const middleware = createDevtoolsMiddleware();
uiBlockingStoreApi.getState().registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, middleware);

// Later, unregister if needed
uiBlockingStoreApi.getState().unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
```

### Accessing Devtools Store

For advanced use cases, you can access the devtools store directly:

```jsx
import { useDevtoolsStore } from "@okyrychenko-dev/react-action-guard-devtools";

function CustomDevtoolsComponent() {
  const { events, isOpen, toggleOpen, clearEvents, isPaused, togglePause } = useDevtoolsStore();

  return (
    <div>
      <button onClick={toggleOpen}>Toggle Devtools</button>
      <button onClick={clearEvents}>Clear History</button>
      <button onClick={togglePause}>{isPaused ? "Resume" : "Pause"}</button>
      <p>Total Events: {events.length}</p>
    </div>
  );
}
```

### Store Selectors

The library provides optimized selectors for filtering events:

```jsx
import {
  useDevtoolsStore,
  selectFilteredEvents,
  selectUniqueScopes,
  selectEventStats,
} from "@okyrychenko-dev/react-action-guard-devtools";

function EventList() {
  // Get filtered events based on current filter settings
  const filteredEvents = useDevtoolsStore(selectFilteredEvents);

  // Get list of unique scopes from all events
  const scopes = useDevtoolsStore(selectUniqueScopes);

  // Get aggregate statistics (counts by action, durations, top scopes)
  const stats = useDevtoolsStore(selectEventStats);

  return (
    <div>
      <h3>Total events: {stats.total}</h3>
      <h3>Scopes: {scopes.join(", ")}</h3>
      <ul>
        {filteredEvents.map((event) => (
          <li key={event.id}>{event.blockerId}</li>
        ))}
      </ul>
    </div>
  );
}
```

## UI Features

### Timeline View

The timeline shows all blocking events in chronological order:

- **Color coding**:
  - 🟢 Green - "add" events (blocker activated)
  - 🔴 Red - "remove" events (blocker deactivated)
  - 🔵 Blue - "update" events (blocker configuration changed)
  - 🟠 Orange - "timeout" events (blocker auto-removed due to timeout)
  - 🟣 Indigo - "clear" / "clear_scope" events (bulk blocker removal)
- **Duration display**: Shows how long blockers were active
- **Expandable details**: Click any event to see full configuration
- **Scope indicators**: Visual tags showing which scopes are affected, including `clear_scope`
- **Export**: Copy the currently filtered events to the clipboard, or download them as a JSON file
  (with export metadata) — handy for bug reports

### Active Blockers View

See all currently active blockers with:

- Priority sorting (highest first)
- Scope and reason information
- How long each blocker has been active
- **Stuck detection**: Blockers active longer than `stuckThresholdMs` (default `10000`) are
  flagged with a **Stuck** warning badge — a quick signal for a missing `unblock()`

### Stats View

Aggregate statistics over the recorded history:

- Total event count
- Average and maximum blocker durations
- Event counts per action type
- Most frequent scopes

### Filtering

Filter events by:

- **Search**: Search by blocker ID, reason, or scope
- **Scope**: Scope-based filtering also matches bulk `clear_scope` events

For action/scope filtering, use `useDevtoolsStore` and `setFilter` in your own UI.

### Controls

- **Pause/Resume**: Stop recording new events to inspect a specific moment
- **Clear**: Remove all events from history
- **Minimize**: Collapse panel to just show active blocker count
- **Close**: Hide devtools panel completely

### Keyboard Shortcuts

When the panel is open (and focus is not in an input or editable element):

- `Esc` - Close panel
- `Space` - Pause/Resume recording
- `C` - Clear events

### Persistence

UI preferences are persisted to `localStorage` and restored across reloads:

- Minimized state
- Active tab
- Filter settings

The panel's **open state and `maxEvents` are not persisted** — they are owned by the `defaultOpen`
and `maxEvents` props and re-applied on every load. Recorded events are also **never** persisted,
since history belongs to a single session. Persistence is automatically skipped in environments
without `localStorage` (e.g. SSR).

## TypeScript Support

The package is written in TypeScript and includes full type definitions:

```typescript
import type {
  // Event types
  DevtoolsEvent,
  DevtoolsEventStats,
  DevtoolsFilter,

  // Store types
  DevtoolsState,
  DevtoolsActions,
  DevtoolsStore,

  // Position type
  DevtoolsPosition,
} from "@okyrychenko-dev/react-action-guard-devtools";
```

## Use Cases

### Debugging Complex Blocking Logic

```jsx
import { useBlocker } from "@okyrychenko-dev/react-action-guard";
import { ActionGuardDevtools } from "@okyrychenko-dev/react-action-guard-devtools";

function ComplexForm() {
  const [step, setStep] = useState(1);

  // Multiple blockers with different priorities
  useBlocker(
    "validation",
    {
      scope: "form",
      priority: 10,
    },
    !isValid
  );

  useBlocker(
    "api-call",
    {
      scope: ["form", "navigation"],
      priority: 100,
    },
    isLoading
  );

  // Devtools shows you exactly what's blocking and why
  return (
    <>
      <form>...</form>
      <ActionGuardDevtools defaultOpen={true} />
    </>
  );
}
```

### Monitoring Production Issues

```jsx
// Enable devtools in production for specific users/scenarios
const isDebugMode = localStorage.getItem("debug") === "true";

function App() {
  return (
    <>
      <YourApp />
      <ActionGuardDevtools showInProduction={isDebugMode} position="left" />
    </>
  );
}
```

### Performance Monitoring

```jsx
import { useDevtoolsStore } from "@okyrychenko-dev/react-action-guard-devtools";

function PerformanceMonitor() {
  const events = useDevtoolsStore((state) => state.events);

  // Find slow blockers
  const slowBlockers = events
    .filter((e) => e.duration && e.duration > 5000)
    .map((e) => ({
      id: e.blockerId,
      duration: e.duration,
    }));

  if (slowBlockers.length > 0) {
    console.warn("Slow blockers detected:", slowBlockers);
  }

  return null;
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm run test`)
2. Code is properly typed (`npm run typecheck`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes in each version.

## Related Projects

- [@okyrychenko-dev/react-action-guard](https://github.com/okyrychenko-dev/react-action-guard) - Main library for UI blocking management

## License

MIT © Oleksii Kyrychenko
