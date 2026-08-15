[**React Action Guard DevTools API v0.1.2**](../README.md)

***

[React Action Guard DevTools API](../README.md) / ActionGuardDevtools

# Function: ActionGuardDevtools()

> **ActionGuardDevtools**(`props`): `ReactElement`\<`unknown`, `string` \| `JSXElementConstructor`\<`any`\>\> \| `null`

Defined in: [src/components/actionGuardDevtools/ActionGuardDevtools.tsx:181](https://github.com/okyrychenko-dev/react-action-guard-devtools/blob/main/src/components/actionGuardDevtools/ActionGuardDevtools.tsx#L181)

ActionGuardDevtools - Visual developer tools panel for debugging UI blocking.

This component provides a floating developer tools panel that visualizes all UI blocking
events in real-time. It shows active blockers, their priorities, scopes, and provides
a timeline of all blocking events with filtering and search capabilities.

**Key Features:**
- Real-time visualization of active blockers
- Timeline of all blocking events (add, remove, timeout)
- Filter by action type, scope, or search term
- Pause/resume event capture
- Keyboard shortcuts (Esc to close, P to pause, C to clear)
- Draggable and resizable panel
- Works with both global store and custom store instances

**Performance:**
- Automatically disabled in production builds (returns `null`)
- Only allocates resources in development
- Uses `showInProduction` prop to override if needed

**Integration:**
- Automatically registers devtools middleware on mount
- Cleans up middleware on unmount
- No configuration required for basic usage

## Parameters

### props

`ActionGuardDevtoolsProps`

Configuration props for the devtools panel

## Returns

`ReactElement`\<`unknown`, `string` \| `JSXElementConstructor`\<`any`\>\> \| `null`

React element in development, `null` in production (unless `showInProduction` is true)

## Examples

Basic usage (global store)
```tsx
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

function App() {
  return (
    <div>
      <YourApp />
      <ActionGuardDevtools />
    </div>
  );
}
```

With custom configuration
```tsx
<ActionGuardDevtools
  position="bottom"
  defaultOpen={true}
  maxEvents={500}
/>
```

With custom store instance (isolated state)
```tsx
import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';
import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';

function IsolatedApp() {
  return (
    <UIBlockingProvider>
      {({ store }) => (
        <>
          <YourApp />
          <ActionGuardDevtools store={store} />
        </>
      )}
    </UIBlockingProvider>
  );
}
```

Keyboard shortcuts
```
Esc        - Close devtools panel
Ctrl/⌘ + P - Toggle pause/resume event capture
Ctrl/⌘ + K - Clear all events
```

## See

 - [DevTools README](https://github.com/okyrychenko-dev/react-action-guard-devtools)
 - [createDevtoolsMiddleware](createDevtoolsMiddleware.md) for manual middleware registration

## Since

0.6.0
