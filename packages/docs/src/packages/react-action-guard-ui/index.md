# UI integration

`@okyrychenko-dev/react-action-guard-ui` turns shared protection into button, field, link and group
state. It ships hooks and pure resolvers, rather than components or a design-system dependency.
Install it alongside core, React and core's Zustand peer. Render producers and controls under one
`UIBlockingProvider`; `GuardedScopeProvider` selects labels but does not create a blocking store.

```tsx
import { UIBlockingProvider, useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import {
  GuardedScopeProvider,
  useGuardedButton,
  useGuardedField,
} from "@okyrychenko-dev/react-action-guard-ui";

function NameField() {
  const { fieldState, reasonContent, ariaDescribedBy } = useGuardedField({
    blockedState: "readOnly",
    reasonMode: "description",
    reasonId: "profile-reason",
  });
  return (
    <>
      <input
        aria-label="Name"
        readOnly={fieldState.readOnly}
        aria-readonly={fieldState.ariaReadOnly}
        aria-describedby={ariaDescribedBy}
      />
      <p id="profile-reason">{reasonContent}</p>
    </>
  );
}

function SaveButton({ save }: { save: VoidFunction }) {
  const { buttonState } = useGuardedButton({ blockedState: "loading" });
  return (
    <button
      disabled={buttonState.disabled}
      aria-busy={buttonState.ariaBusy}
      aria-disabled={buttonState.ariaDisabled}
      onClick={save}
    >
      Save
    </button>
  );
}

function ProfileControls({ pending, save }: { pending: boolean; save: VoidFunction }) {
  useActionBlocker("profile-save", { scope: "profile", reason: "Saving profile" }, pending);
  return (
    <GuardedScopeProvider scope="profile">
      <NameField />
      <SaveButton save={save} />
    </GuardedScopeProvider>
  );
}

export function Profile({ pending, save }: { pending: boolean; save: VoidFunction }) {
  return (
    <UIBlockingProvider>
      <ProfileControls pending={pending} save={save} />
    </UIBlockingProvider>
  );
}
```

## Scope and reason accessibility

A nonempty explicit `scope` wins over inherited guarded scope. Omitted or empty explicit scopes
inherit; without inheritance they fall back to global. This is UI inheritance, not core empty-array
registration matching. Existing disabled/loading/read-only flags remain preserved according to control
kind. Description/helper-text modes need a nonblank `reasonId` while displaying a blocked reason;
render the matching DOM element and attach returned ARIA props. `hidden` mode suppresses reason UI.

## Public hook reference

| Hook                                          | Result / use                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `useTopBlocker`                               | Highest-priority matching blocker and reason                                 |
| `useGuardedAction` / `useGuardedButton`       | `actionState` / `buttonState`, availability and reason props                 |
| `useGuardedField`                             | `fieldState`, disabled/read-only/loading policy and reason props             |
| `useGuardedLink`                              | `linkState`, guarded `onClick`, availability and reason props                |
| `useGuardedGroup`                             | Region state and reason props; does not automatically disable child controls |
| `useGuardedScope` / `useResolvedGuardedScope` | Context scope and explicit/inherited resolution                              |

`GuardedFormScopeProvider` is also supported. `getActionState`, `getButtonState`, `getFieldState`
and group state mapping bridge resolved state into design-system prop shapes. Pure
`resolveGuardedActionState`, `resolveGuardedFieldState`, `resolveGuardedGroupState` and
`resolveGuardedLinkState` support integrations without hooks. Visually hidden class/style/CSS
exports help render accessible reason text.

## Guard links through their handler

```tsx
import { useGuardedLink } from "@okyrychenko-dev/react-action-guard-ui";

export function ExitLink() {
  const { linkState, onClick, ariaDescribedBy, reasonContent } = useGuardedLink({
    scope: "navigation",
    reasonMode: "description",
    reasonId: "exit-reason",
    removeFromTabOrder: true,
  });
  return (
    <>
      <a
        href="/other"
        aria-disabled={linkState.ariaDisabled}
        tabIndex={linkState.tabIndex}
        aria-describedby={ariaDescribedBy}
        onClick={onClick}
      >
        Leave
      </a>
      <p id="exit-reason">{reasonContent}</p>
    </>
  );
}
```

Wire the returned `onClick`: ARIA state alone does not stop link activation. Propagation and tab-order
options remain link-specific. Router-wide interception requires a [router adapter](../react-action-guard-router/).
The [package reference](https://github.com/okyrychenko-dev/react-action-guard/tree/main/packages/ui#readme)
retains complete option/type details. Continue with [forms](../../guides/forms) and [ownership](../../advanced/ownership).
