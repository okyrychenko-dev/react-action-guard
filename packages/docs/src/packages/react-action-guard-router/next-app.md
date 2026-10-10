# Next.js App Router

The App Router adapter offers **unload-only protection**. It does not intercept same-document
`Link`, `router.push`, `replace`, or back/forward navigation. `onConfirm` is not evaluated.
Do not build a workflow that depends on those paths being blocked.

```tsx
"use client";
import { useAppRouterBlocker } from "@okyrychenko-dev/react-action-guard-router/nextjs";

export function UnloadProtection({ dirty }: { dirty: boolean }) {
  const { isBlocking } = useAppRouterBlocker({
    when: dirty,
    scope: "navigation",
    blockBrowserUnload: true,
  });
  return <p>Unload protection requested: {String(isBlocking)}</p>;
}
```

Render inside the Next application and a [client provider boundary](../../advanced/ssr).
`isBlocking` indicates active policy, not observed navigation interception. `beforeunload` can request
browser tab-close/reload confirmation subject to browser policy and user activation. Custom text
may be ignored. Turning off `blockBrowserUnload` removes this adapter's only protection.

Real packed Next App build/start/browser verification remains pending; declarations and mocked
hooks do not supply it. See the [capability matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md).
Use the explicit hook; `/nextjs` default `useNavigationBlocker` is the [Pages adapter](./next-pages).
