# Forms and saves

Use local pending state for a single control. Register shared protection when a form, toolbar
and navigation need to react to the same save. Place the producer and consumers below the
same `UIBlockingProvider`; keep unrelated help outside the protected scopes.

```tsx
import { useState } from "react";
import {
  UIBlockingProvider,
  useActionBlocker,
  useBlockingInfo,
  useIsBlocked,
} from "@okyrychenko-dev/react-action-guard";

function Save({ persist }: { persist: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  useActionBlocker(
    "profile-save",
    {
      scope: ["profile", "navigation"],
      reason: "Saving profile",
    },
    pending
  );

  async function save() {
    setPending(true);
    setError(undefined);
    try {
      await persist();
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button disabled={pending} onClick={save}>
        Save
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

function ProfileField() {
  const blocked = useIsBlocked("profile");
  const blockers = useBlockingInfo("profile");
  return (
    <>
      <input aria-label="Name" disabled={blocked} />
      <p role="status">{blockers[0]?.reason}</p>
    </>
  );
}

export function Profile({ persist }: { persist: () => Promise<void> }) {
  return (
    <UIBlockingProvider>
      <Save persist={persist} />
      <ProfileField />
    </UIBlockingProvider>
  );
}
```

This registration belongs to the mounted `Save` component. If it can disappear while work is
pending, use [execution tracking](./workflows) or a mutation owner instead. A disabled button
helps normal interaction; it does not enforce backend idempotency or prevent programmatic calls.
For read-only fields, accessible reasons and design systems, see the [UI integration](../packages/react-action-guard-ui/).
Connect the `navigation` scope with a [router adapter](./navigation).
