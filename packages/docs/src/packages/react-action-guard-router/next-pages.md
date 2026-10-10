# Next.js Pages Router

Import the explicit Pages hook from `/nextjs`. Mount it in a client-rendered component inside the
Pages router context and blocking provider. Install Next and the router/core peers for your versions.

```tsx
import { usePagesRouterBlocker } from "@okyrychenko-dev/react-action-guard-router/nextjs";

export function PagesProtection({ dirty }: { dirty: boolean }) {
  const { isBlocking } = usePagesRouterBlocker({
    when: dirty,
    scope: "navigation",
    message: "Leave without saving?",
    onConfirm: async (message) => window.confirm(message),
  });
  return <p>Protection active: {String(isBlocking)}</p>;
}
```

This is limited route-event interception. Async acceptance cancels the attempted event and replays
via `router.push(url)` with single-use permission; stale answers do not push or notify. Original
shallow, scroll, locale and history semantics may be lost during replay. Route-event coverage does
not imply complete back/forward or every navigation path coverage. Unload protection remains
browser-controlled. `isBlocking` reports active policy, not complete interception.

Real packed Next build/start/browser verification remains pending. Existing hook and declaration
checks establish only their stated evidence kinds; see the [capability matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md).
Prefer the explicit `usePagesRouterBlocker` name; the entry's `useNavigationBlocker` compatibility
export also selects Pages. [App Router](./next-app) has a different, unload-only contract.
