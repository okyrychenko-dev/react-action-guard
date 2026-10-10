# Router public reference

Import through the supported public entries described in the [integration guide](./).

## API Reference

### Hooks

#### `useNavigationBlocker(options)`

Blocks navigation in router applications based on conditions or scope state.

**Parameters:**

- `options: UseNavigationBlockerOptions`
  - `when?: boolean | (() => boolean)` - Condition to activate blocking
  - `scope?: string | string[]` - Scope(s) from react-action-guard to monitor
  - `message?: string` - Confirmation dialog message
  - `onConfirm?: (message: string) => boolean | PromiseLike<boolean>` - Custom confirmation handler, called once per blocked navigation attempt
  - `onBlock?: () => void` - Callback when navigation is blocked
  - `onAllow?: () => void` - Callback when navigation is allowed
  - `blockBrowserUnload?: boolean` - Block tab close/refresh (default: `true`)

**Returns:** `{ isBlocking: boolean; isIntercepting?: boolean }`

- `isBlocking` - Blocking condition is armed for this adapter
- `isIntercepting?: boolean` - Active interception state when the router can expose it

**Available in:**

- `@okyrychenko-dev/react-action-guard-router/react-router` - React Router v6.19+ & Remix
- `@okyrychenko-dev/react-action-guard-router/tanstack-router` - TanStack Router
- `@okyrychenko-dev/react-action-guard-router/nextjs` - Next.js Pages & App Router

#### `useDialogState<TMessage = string>()`

Helper hook for managing custom confirmation dialogs.

**Parameters:** None

**Returns:**

- `dialogState: DialogState<TMessage> | null` - Current dialog state
  - `message: TMessage` - The message passed to confirm
  - `isOpen: boolean` - Whether dialog is open
  - `resolve: (value: boolean) => void` - Settle and close this specific dialog
- `confirm: (message: TMessage) => Promise<boolean>` - Show dialog, returns Promise
- `onConfirm: () => void` - Resolve dialog with `true`
- `onCancel: () => void` - Resolve dialog with `false`

Each request settles once: confirmation resolves `true`; cancellation, replacement by
another `confirm` call, and hook unmount resolve `false`. Calling `dialogState.resolve`
also closes that dialog. Repeated calls and resolvers captured from an older dialog
have no effect on a newer dialog.

Effect teardown also cancels and clears the pending dialog when React preserves
hook state, such as when an `Activity` becomes hidden. Revealing the subtree starts
with no open dialog and allows new confirmation requests.

`confirm`, `onConfirm`, and `onCancel` retain stable references across renders.
The hook-level `onConfirm` and `onCancel` always act on the current dialog; use its
`dialogState.resolve` when a captured callback must belong to a specific dialog.

#### `usePrompt(message, when)` (React Router only)

Simple API similar to React Router v5's `usePrompt`.

**Parameters:**

- `message: string` - Confirmation message
- `when: boolean | (() => boolean)` - Condition to activate blocking

#### `useBeforeUnload(when, message?)`

Standalone hook for blocking browser unload events (tab close, refresh).

**Parameters:**

- `when: boolean | (() => boolean)` - Condition to activate blocking
- `message?: string` - Optional custom message (default: "Changes you made may not be saved.")

This utility works independently of any router and can be used in any React application.

---

For executable examples, follow the integration guide and its linked workflow pages.

The root entry also exports `resolveCondition`, `createBlockerId`, `isDefined`, `normalizeScope`
and shared types. Navigation adapter option types come from the adapter subpaths. React Router
also exports `usePromptWithOptions`; `block` remains a deprecated alias of `when`.
`onConfirm` is not evaluated by Next App Router; consult the per-router capability pages.
