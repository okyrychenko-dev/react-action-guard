# Evaluated enterprise workflows

This demo uses one isolated `UIBlockingProvider` and one QueryClient per session.
Nested consumers, presets, admin clear actions, audit observation and order metrics
resolve the nearest provider. The `global` scope means every scope in that session;
it does not mean the process-global store. Two mounted instances do not share
blockers, audit events, query caches or order notifications.

## Run against current package artifacts

The checked-in registry lockfile installs the published baseline. It alone does
not validate this demo against the corrected package generation. Use Node 22+,
npm and the package repository's configured pnpm version:

```bash
npm ci
npm run setup:local -- /absolute/path/to/react-action-guard
npm run test:imports
npm run typecheck
npm run lint
npm test
npm run test:browser
npm run build
npm run dev
```

When this repository is at `react-action-guard/examples/enterprise-demo`, the source
path defaults to `../..`. The setup builds core, router, TanStack, UI and Devtools, reuses the
package repository's Changesets cohort helper to apply pending versions in a
throwaway directory, and installs packed copies with strict peer checks. It changes
neither source package manifests nor the demo manifest/lockfile. It records the
source commit, working-tree dirty flag, evaluated versions and archive hashes in
`.cache/local-packages/evidence.json`. Test and browser results are meaningful only
after this step. An `npm ci` or ordinary `npm install` restores published packages;
rerun `setup:local` afterwards. Restart Vite after replacing artifacts.

The browser suite uses installed Google Chrome, matching the package repository's
history fixture. On Linux, Chrome must be available to Playwright's `chrome` channel.
The custom Guard Inspector retains the application audit trail. The separate package
Devtools panel observes the same nearest session store and receives explicit action/scope
declarations. Open its shield button, then Active Blockers to inspect scope relationships.

## Checkout navigation

Edit the shipping address or payment reference and click a sidebar destination.
The React Router adapter receives both a message and the existing custom dialog
callback. **Stay and save** retains the checkout location; **Leave anyway** navigates
to the requested destination. Cancelling lets **Save cart** clear the dirty state,
after which navigation proceeds without a dialog. Browser back and forward use the
same confirmation. Unmounting a dialog cancels its pending attempt; callbacks from
superseded dialogs cannot approve newer attempts. Browser unload uses the browser's
native prompt; custom prompt text and that unload interaction are not verified here.

## Autosave and agent/user revision coordination

Autosave is opt-in. After 800 ms without address/reference edits and with checkout
available, it invokes the existing guarded Save cart operation. Holds postpone it;
removing a hold starts a fresh debounce. Disabling autosave, unmounting Checkout or
resetting cancels the timer. The save protects checkout and navigation until the
simulated save completes, clearing the unsaved navigation blocker.

The separate revision panel has manual property edits, revision save, manual
recalculation and a controllable agent edit. Both operation sources protect
`property`, `revision`, `recalculation`; help/chat and read-only revision information
remain available. Complete applies the captured proposal and advances revision;
failure/cancellation releases scopes without applying it. Manual saves record the
current revision. This uses public core/UI hooks, no external provider. The operation
remains pending until explicitly settled; unmount/reset discards it.

The pending-operation gate prevents duplicate starts in this demonstration.
Permission, idempotency, backend exclusion and actual request cancellation remain
application responsibilities; this is not production adoption evidence.

## Query policy

Open Integrations. The disabled gateway query starts pending but idle: payment is
available and **Run health check** is enabled. The first fetch blocks payment for
1.2 seconds. Completion releases it. Running again blocks during the background
refetch while retaining the previous data. This exercises `useBlockingQuery` with
`onFetching: true`, rather than a hand-written `isFetching` blocker.

## Refund execution

In Admin, **Refund order** opens approval. Cancel invokes no finance operation.
Rapid approval calls share a single running operation; the tests count invocations
of the simulated finance API, rather than relying on disabled buttons. A new refund
can run after settlement. Reset or route unmount aborts the application's pending
finance request.

## Payment lifetime and reset

Enable **Slow gateway**, then **Place order**. The request lasts 6.5 seconds and the
blocker expires after 5 seconds. The inspector records `timeout`, fields unlock and
the page explains that payment is still running. **Place order** remains disabled by
application-owned pending state; the controller guard also rejects repeated calls.
Wait for completion, or use **Cancel pending** to abort the request. Cancellation is
separate from blocker timeout and allows a subsequent order. **Fail next payment**
produces a failure, consumes the flag and exposes **Retry order**.

**Reset demo** replaces the selected provider and QueryClient, remounts local demo
state, aborts pending payment/refund/query work and suppresses old save/coupon
callbacks. Late cleanup belongs to the old store and cannot add audit events to the
fresh session. Strict Mode setup rearms lifetime tracking after its effect probe.
Blockers owned by a route disappear when that route unmounts; use Dashboard presets
or Admin maintenance when demonstrating scope coordination across routes.

## Verification seams

- Real React Router locations: cancellation, confirmation, save then leave, unmount
  and stale dialog settlement.
- Two provider roots with nested consumers: independent blockers/audit/reset and
  order metrics; pending operations settling after reset.
- Real QueryClient and rendered gateway controls: idle, active fetch and refetch.
- Public admin/checkout hooks: finance invocation counts, timeout versus running
  payment, app cancellation/retry and Strict Mode completion.
- Rendered checkout/revision controls: autosave, shared protection, success/failure/
  cancellation/reset and store-local Devtools action declarations.
- Chrome: sidebar navigation and browser back/forward, with actual URL assertions.

This is a simulated application. No payment backend or additional router is validated.
