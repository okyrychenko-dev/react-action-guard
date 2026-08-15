[**React Action Guard API v0.6.0**](../README.md)

***

[React Action Guard API](../README.md) / useBlockingInfo

# Function: useBlockingInfo()

> **useBlockingInfo**(`scope`): readonly [`BlockerInfo`](../interfaces/BlockerInfo.md)[]

Defined in: [src/hooks/useBlockingInfo/useBlockingInfo.ts:80](https://github.com/okyrychenko-dev/react-action-guard/blob/main/src/hooks/useBlockingInfo/useBlockingInfo.ts#L80)

Gets detailed information about all active blockers for a specific scope.

Returns an array of blocker information objects, sorted by priority (highest first).
Each blocker object contains id, reason, priority, and scope information.
The hook automatically re-renders when blockers are added, removed, or updated.

Uses memoization to provide a stable reference - only re-renders when the actual
blocker list changes, not on every store update. This makes it efficient for
rendering lists of blockers.

Works with both the global store and isolated provider instances (via UIBlockingProvider).

## Parameters

### scope

`string` = `DEFAULT_SCOPE`

Scope to get blocking information for. Defaults to "global" if not specified.

## Returns

readonly [`BlockerInfo`](../interfaces/BlockerInfo.md)[]

Array of [BlockerInfo](../interfaces/BlockerInfo.md) objects, sorted by priority (highest to lowest)

## Examples

Display list of active blockers
```tsx
function BlockerList() {
  const blockers = useBlockingInfo('form');
  
  if (blockers.length === 0) {
    return <div>No active blockers</div>;
  }
  
  return (
    <ul>
      {blockers.map((blocker) => (
        <li key={blocker.id}>
          {blocker.reason} (Priority: {blocker.priority})
        </li>
      ))}
    </ul>
  );
}
```

Show highest priority blocker reason
```tsx
function BlockingBanner() {
  const blockers = useBlockingInfo('global');
  
  // blockers are already sorted by priority (highest first)
  const topBlocker = blockers[0];
  
  if (!topBlocker) {
    return null;
  }
  
  return <div className="banner">{topBlocker.reason}</div>;
}
```

Count active blockers
```tsx
function BlockerCount() {
  const formBlockers = useBlockingInfo('form');
  const navBlockers = useBlockingInfo('navigation');
  
  const total = formBlockers.length + navBlockers.length;
  
  return <div>{total} active blockers</div>;
}
```

## See

 - [useIsBlocked](useIsBlocked.md) for a simple boolean check
 - [useBlocker](useBlocker.md) to create blockers
 - [BlockerInfo](../interfaces/BlockerInfo.md) for the structure of blocker information objects

## Since

1.0.0
