# React Router and Remix

Install the router package, core and `react-router-dom` with the peers required by your versions.
Import `useNavigationBlocker` from the `/react-router` subpath and mount it inside a data router
(`createBrowserRouter` / `RouterProvider`) and the blocking provider. A plain `BrowserRouter` does
not provide the data-router blocker API. Remix applications must provide the corresponding router
context; do not interpret hook unit evidence as a separate framework-runtime certification.

```tsx
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";

export function EditorNavigation({ dirty }: { dirty: boolean }) {
  const { isBlocking, isIntercepting } = useNavigationBlocker({
    when: dirty,
    scope: "navigation",
    message: "Leave this editor?",
    blockBrowserUnload: true,
  });
  return <p>{isIntercepting ? "Waiting for confirmation" : String(isBlocking)}</p>;
}
```

The native router captures a blocked transition. Confirmation permission belongs to the current
attached transition and is consumed once. Denial resets the blocked attempt; replacement, scope
ownership changes and cleanup invalidate stale answers. `onAllow` describes acceptance once for
that attempt. `isBlocking` is the active policy; `isIntercepting` reports an intercepted transition.
The deprecated `block` option remains compatible; use `when` in new code. `usePrompt` and
`usePromptWithOptions` are convenience exports, not a React Router v5 runtime adapter.

See [shared options and async dialog](./), [navigation guide](../../guides/navigation) and
[capability evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md).
