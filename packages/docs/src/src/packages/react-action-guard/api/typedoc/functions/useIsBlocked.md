[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useIsBlocked

# Function: useIsBlocked()

> **useIsBlocked**(`scope?`): `boolean`

Defined in: [src/hooks/useIsBlocked/useIsBlocked.ts:73](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useIsBlocked/useIsBlocked.ts#L73)

Checks if one or more scopes are currently blocked.

Returns a boolean indicating whether any of the specified scopes have active blockers.
The hook automatically re-renders the component when the blocking state changes,
ensuring your UI always reflects the current blocking state.

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Parameters

### scope?

Scope(s) to check for blocking. Can be:
               - A single scope string (e.g., "form", "navigation", "global")
               - An array of scopes (e.g., ["form", "navigation"])
               - undefined to check the "global" scope

`string` | readonly `string`[]

## Returns

`boolean`

true if ANY of the specified scopes are blocked, false otherwise

## Examples

Basic single scope check
```tsx
function SubmitButton() {
  const isFormBlocked = useIsBlocked('form');
  
  return (
    <button disabled={isFormBlocked}>
      {isFormBlocked ? 'Processing...' : 'Submit'}
    </button>
  );
}
```

Multiple scopes check
```tsx
function NavigationLink({ href, children }) {
  const isBlocked = useIsBlocked(['navigation', 'global']);
  
  return (
    <a
      href={href}
      onClick={(e) => {
        if (isBlocked) {
          e.preventDefault();
          alert('Navigation is currently blocked');
        }
      }}
      style={{ opacity: isBlocked ? 0.5 : 1 }}
    >
      {children}
    </a>
  );
}
```

Conditional rendering based on blocking state
```tsx
function SaveIndicator() {
  const isSaving = useIsBlocked('save');
  
  if (!isSaving) {
    return null;
  }
  
  return <div className="spinner">Saving...</div>;
}
```

## See

 - [useBlocker](useBlocker.md) to create a blocker
 - [useBlockingInfo](useBlockingInfo.md) to get detailed information about active blockers

## Since

1.0.0
