# Getting started

A save can conflict with editing and navigation in separate components. React Action Guard lets
one producer register shared scopes and independent consumers observe availability and reasons.
Use local pending state if one component already owns the whole interaction.

## Install core

```bash
npm install @okyrychenko-dev/react-action-guard zustand
```

Install compatible React/React DOM peers for your application. Start with a `UIBlockingProvider`:

```tsx
import {
  UIBlockingProvider,
  useAsyncAction,
  useBlockingInfo,
  useIsBlocked,
} from "@okyrychenko-dev/react-action-guard";

function Save({ persist }: { persist: () => Promise<void> }) {
  const execute = useAsyncAction<void>("save-profile", ["profile", "navigation"]);
  const blocked = useIsBlocked("profile");
  async function save() {
    try {
      await execute(persist);
    } catch (error) {
      console.error("Save failed", error);
    }
  }
  return (
    <button disabled={blocked} onClick={save}>
      Save
    </button>
  );
}

function NameField() {
  const blocked = useIsBlocked("profile");
  const reasons = useBlockingInfo("profile");
  return (
    <>
      <input aria-label="Name" disabled={blocked} />
      <p role="status">{reasons[0]?.reason}</p>
    </>
  );
}

export function App({ persist }: { persist: () => Promise<void> }) {
  return (
    <UIBlockingProvider>
      <Save persist={persist} />
      <NameField />
      <button>Help</button>
    </UIBlockingProvider>
  );
}
```

`persist` is your application's save function. Each call is tracked through settlement even if the
caller unmounts; protection does not exclude concurrent calls or cancel work. Adapt failure feedback
to your UI; the [forms guide](/guides/forms) shows visible errors. The `navigation` label affects
navigation only after a consumer such as a router hook is attached.

## Run a complete example

From a repository checkout:

```bash
pnpm install
pnpm --filter @okyrychenko-dev/react-action-guard run build
pnpm --filter react-action-guard-core-example run dev
```

See [core coordination instructions](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination)
for success, failure/retry, detached-producer behavior and comparisons with local state/Context.

## Learn progressively

1. [Concepts](/concepts): actions, scopes, priority, reasons and lifetime.
2. Guides: [forms](/guides/forms), [mutations](/guides/mutations), [navigation](/guides/navigation),
   [workflows](/guides/workflows) and [registration](/guides/lifecycle).
3. Optional integrations: [UI](/packages/react-action-guard-ui/), [Router](/packages/react-action-guard-router/),
   [TanStack Query](/packages/react-action-guard-tanstack/) and [Devtools](/packages/react-action-guard-devtools/).
4. Advanced: [ownership / typed hooks](/advanced/ownership), [SSR](/advanced/ssr) and [observability](/advanced/observability).
5. [Core contract](/packages/react-action-guard/contract), [migration](/packages/react-action-guard/migration)
   and [public API reference](/packages/react-action-guard/api/typedoc/README).

Provider ownership is recommended for production and required for request isolation; global fallback
is shared convenience state. Explicit registration IDs must be unique in a store. Priority orders
reasons while every matching blocker retains protection. Timeout releases protection without
cancelling work. Next Pages has limited interception and App Router has unload-only protection;
read their separate integration pages before relying on navigation behavior.
