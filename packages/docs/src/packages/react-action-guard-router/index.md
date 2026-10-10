# Router integrations

`@okyrychenko-dev/react-action-guard-router` observes core scopes or an explicit `when` condition
and connects them to router-specific interception. Use it under `UIBlockingProvider` and the relevant
router context. Install only your router peer; the other router peers are optional.

The root entry provides `useBeforeUnload`, `useDialogState`, shared types and utilities. Import
navigation hooks from their adapter subpaths so applications do not require every router peer.

| Router                                 | Public entry                       | Capability                                                   |
| -------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| [React Router / Remix](./react-router) | `/react-router`                    | Native data-router blocking and current-attempt confirmation |
| [TanStack Router](./tanstack-router)   | `/tanstack-router`                 | Native blocker composition and confirmation                  |
| [Next Pages](./next-pages)             | `/nextjs`: `usePagesRouterBlocker` | Limited event cancellation / replay                          |
| [Next App](./next-app)                 | `/nextjs`: `useAppRouterBlocker`   | Unload only; no same-document interception                   |

Entries above append to `@okyrychenko-dev/react-action-guard-router`. The `/nextjs` default
`useNavigationBlocker` aliases Pages Router for compatibility; prefer explicit names.
`when` and scope protection combine with OR logic: either can activate blocking. With neither
configured, protection is inactive. Specify your policy explicitly.

## Shared options and dialogs

`scope`, `when`, `message`, `onBlock`, `onAllow`, `blockBrowserUnload` and `onConfirm` are the
shared navigation options. `onConfirm` returns a boolean or promise-like boolean for same-document
confirmation on adapters that implement it. Unload remains browser-controlled and cannot await it.

```tsx
import { useDialogState } from "@okyrychenko-dev/react-action-guard-router";
import { useNavigationBlocker } from "@okyrychenko-dev/react-action-guard-router/react-router";

export function LeaveDialog() {
  const { dialogState, confirm, onConfirm, onCancel } = useDialogState();
  useNavigationBlocker({ scope: "navigation", onConfirm: confirm });
  if (!dialogState) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Leave page?">
      <p>{dialogState.message}</p>
      <button onClick={onConfirm}>Leave</button>
      <button onClick={onCancel}>Stay</button>
    </div>
  );
}
```

Supply accessible focus management for a production dialog. Replaced/unmounted attempts invalidate
obsolete async answers. Use the [versioned capability matrix](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md)
for evaluated versions and limitations. The [package reference](https://github.com/okyrychenko-dev/react-action-guard/tree/main/packages/router#readme)
retains the full options and helper API. See [navigation policy](../../guides/navigation).
