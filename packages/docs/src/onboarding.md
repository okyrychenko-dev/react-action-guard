<script setup>
import { withBase } from 'vitepress'
</script>

# Try coordination

This demo runs the **current workspace source**, through Core's public entry point.
It is the same checked React application as `examples/core-coordination`, embedded here rather
than rewritten for the documentation. No request leaves your browser.
[Versions and migration](/versions) separates the published cohort, this source build and pending
changes. The [published-version quickstart](/getting-started) is checked against installed npm
declarations; this demo is not an archived build of that release.

<a :href="withBase('/demo/coordination/index.html')">Open the demo on its own</a> ·
<a :href="withBase('/demo/coordination/provenance.json')">Exact build revision and source manifest</a>

<iframe
  :src="withBase('/demo/coordination/index.html')"
  title="Interactive save and independent consumers"
  loading="lazy"
  style="width: 100%; height: 760px; border: 1px solid #888; border-radius: 8px;"
></iframe>

## Try these paths

1. **Save profile** protects editing and navigation. Both consumers explain why they are disabled.
   **Show help** remains available. Wait for success to release protection.
2. During a save, **Invoke save command** calls the command directly. It checks the current store
   before starting work, so a disabled button is not the only policy boundary.
3. Enable **Simulate save failure** and save. Rejection announces an error and releases both
   consumers. Turn failure off and retry.
4. Start a save and turn off **Show save controls**. Work continues after producer unmount;
   protection remains until settlement. Showing controls again creates a fresh producer.
5. Turn on both **Keep editor A draft** and **Keep editor B draft**. Clear A: navigation stays
   protected by B. Clear B to release it. Drafts affect navigation only; save and help remain usable.

Use Tab and Enter/Space to operate controls. Reasons use status announcements and are associated
with disabled consumers through `aria-describedby`; errors use an alert. The demo also works on
its own at narrow screen widths.

## One policy, explicit ownership

Scopes encode application-selected conflicts: the save conflicts with `profile` and `navigation`,
while drafts conflict with `navigation`. Help observes `help`, so it remains independent. Scope
names match exactly; dots do not imply hierarchy. A `global` blocker affects ordinary observations.

Each repeated editor needs its own registration ID within its Provider. Pass a unique owner ID
for each mounted instance (including two views of the same record), or isolate independent workflows
in separate Providers. Reusing a literal ID in repeated instances is unsafe: one owner could update
or remove another owner's registration. This is the repeated-owner component used by the demo:

<<< ../../../examples/core-coordination/src/DraftOwner.tsx

## Guard commands as well as controls

Read a fresh Provider store snapshot inside the command, before starting the operation. The demo's
**Save profile** and **Invoke save command** use this same entry point. The first execution registers
its blocker synchronously before another command can start. This is client availability policy;
server permissions, idempotency and cancellation remain application responsibilities.

<<< ../../../examples/core-coordination/src/SavePanel.tsx

`useAsyncAction` tracks **every invocation** independently. It does not deduplicate, authorize or
exclude calls; the command above implements the example's repeat-submit policy. A timeout releases
protection without cancelling work. Pending promises retain protection after producer unmount.
Mounted draft registrations, in contrast, release on detach. See [ownership](/advanced/ownership)
and [lifecycle](/guides/lifecycle).

The [producer lifetime comparison](/guides/lifecycle#choose-a-producer-by-lifetime) explains why
pending async protection survives here while mounted confirmable protection ends on unmount.

## When local state is enough

For one button whose pending state has no independent consumers, use local React state or the
mutation library's state. Shared coordination becomes useful when separate features need consistent
availability and reasons across several producers. The simulated input does not persist data, and
**Open dashboard** changes a local label. For actual navigation use the
[Router capability matrix](/packages/react-action-guard-router/): React Router and TanStack Router
can intercept SPA transitions; Next App Router offers guarded application entry points and unload
protection, without universal browser-back interception.

[Run and verify the same example locally](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/core-coordination).
