# TanStack Router

This integration is for **TanStack Router**, not the Query adapter. Install `@tanstack/react-router`
and the router package/core peers. Mount under your TanStack router and blocking provider.

```tsx
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/tanstack-router";

export function NavigationProtection({ dirty }: { dirty: boolean }) {
  const { isBlocking } = useNavigationBlocker({
    when: dirty,
    scope: "navigation",
    message: "Discard changes?",
    onConfirm: (message) => window.confirm(message),
  });
  return <p>Protection active: {String(isBlocking)}</p>;
}
```

The adapter composes with the native blocker; it does not monkey-patch navigation methods.
Confirmation stays with the current attempt; replacement/cleanup invalidate stale async answers.
Native arbitration with other blockers remains in TanStack Router. `isBlocking` describes active
policy rather than proving every navigation was intercepted. Browser unload uses `beforeunload`
subject to browser policy and never awaits `onConfirm`.

See [shared options](./), [navigation guide](../../guides/navigation) and
[capability evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md).
