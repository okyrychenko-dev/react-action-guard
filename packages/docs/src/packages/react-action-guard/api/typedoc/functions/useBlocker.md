[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useBlocker

# Function: useBlocker()

> **useBlocker**(`blockerId`, `config`, `isActive`): `void`

Defined in: [src/hooks/useBlocker/useBlocker.ts:81](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useBlocker/useBlocker.ts#L81)

Automatically manages a UI blocker based on component lifecycle.

Creates a blocker that is automatically added when the condition is true
and removed when the component unmounts or condition becomes false.
Supports scoped blocking, priorities, timeouts, and works with both
global store and isolated provider instances.

## Parameters

### blockerId

`string`

Unique identifier for this blocker. Must be unique within the scope.

### config

[`BlockerConfig`](../interfaces/BlockerConfig.md)

Configuration object for the blocker

### isActive

`boolean` = `true`

When true, blocker is active; when false, blocker is removed.
                  Defaults to true. Use this for conditional blocking.

## Returns

`void`

## Examples

Basic form submission blocking
```tsx
function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useBlocker('form-submit', {
    scope: 'form',
    reason: 'Submitting form...',
    priority: 50,
    timeout: 30000, // Auto-remove after 30 seconds
    onTimeout: () => {
      console.warn('Form submission timed out');
      setIsSubmitting(false);
    }
  }, isSubmitting);
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

Multiple scopes with high priority
```tsx
useBlocker('critical-save', {
  scope: ['form', 'navigation', 'actions'],
  reason: 'Saving critical data...',
  priority: 90,
}, isSaving);
```

Conditional blocking based on unsaved changes
```tsx
function Editor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useBlocker('unsaved-changes', {
    scope: 'navigation',
    reason: 'You have unsaved changes',
    priority: 80,
  }, hasUnsavedChanges);
  
  return <div>...</div>;
}
```

## See

 - [useIsBlocked](useIsBlocked.md) to check if a scope is currently blocked
 - [useBlockingInfo](useBlockingInfo.md) to get detailed blocker information
 - [useAsyncAction](useAsyncAction.md) for async operation wrapping with automatic blocking
 - [useConfirmableBlocker](useConfirmableBlocker.md) for blockers that require user confirmation

## Since

0.6.0
