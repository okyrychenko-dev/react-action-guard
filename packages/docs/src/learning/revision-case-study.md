# A revision workflow: demonstration and pilot plan

Editorial draft. This is an illustrative case study of repository code, followed by an
integration plan. No real application was provided for this batch; production adoption and
before/after production outcomes remain unmeasured.

## The scenario

A user and a simulated agent share a property editor. Applying a proposal or recalculating a
revision must make conflicting controls wait, but help should remain available. The existing
[enterprise showcase](https://github.com/okyrychenko-dev/react-action-guard/tree/main/examples/enterprise-demo)
implements this in `src/features/coordination`. Its `useCoordinationWorkflow` owns proposal
state and a synchronous pending ref; `CoordinationWorkspace` renders guarded controls.

Both producers declare `property`, `revision` and `recalculation` through a mounted
`useActionBlocker`. The field observes `property`; save/recalculation controls observe the
shared scope array. Help observes `help`. The workflow checks its own pending ref and current
store protection before accepting a start, edit or save. `type-utils` supplies optional-value
narrowing and exhaustive outcome checking. Scope observation does not replace that entry gate.

## Reproduce the demonstration

From the repository root, use the existing local-pack setup. The enterprise demo is outside
this repository's pnpm workspace; its npm commands must run in its own directory.

```bash
pnpm install --frozen-lockfile
pnpm run build
cd examples/enterprise-demo
npm ci
npm run setup:local
npm run test:imports
npm run dev
```

The setup script installs local package tarballs; the imports check verifies their provenance.
Use the Vite URL printed by the final command. In Checkout:

1. Start **Start agent edit**. Property, save and manual recalculation become unavailable.
2. Open **Help and chat**. It remains available and does not contact an external service.
3. Choose **Complete operation**. The property becomes `Agent proposal` and revision becomes 2.
4. Reset and repeat with **Fail operation** or **Cancel operation**. The original property and
   revision 1 remain; a manual recalculation can then start.
5. Complete that recalculation and **Save revision**. The saved local revision becomes 2.
6. Start a new proposal and leave Checkout or reset the demo. Returning starts a fresh local
   editor; the previous pending proposal is discarded.

## What is actually checked

Run these commands from `examples/enterprise-demo` after local-pack setup:

```bash
npm test -- src/app/showcase.test.tsx
npm run typecheck
```

The existing rendered App tests exercise shared protection, help, completion, failure,
cancellation, retry, revision saving, route-unmount/reset cleanup, Devtools declarations and
checkout autosave. Those checks run with real Providers and router composition in a DOM test
environment. The separate `browser/showcase.pw.ts` fixture is available via `npm run test:browser -- browser/showcase.pw.ts`
when Playwright browsers are installed; a DOM test run is not browser evidence.

The observed demonstration benefit is a shared availability policy across the rendered
controls while unrelated help stays usable. There is no before-version implementation for
this revision example, no measured reduction in predicates, and no production defect baseline.
Saving here updates local state; cancellation discards a local proposal. Neither demonstrates
server persistence, request abortion or stale-result protection in a real backend.

## Move from illustration to evaluation

The [pilot plan](./workflow-pilot) chooses a real revision editor as the target, records the
application access prerequisite, and defines baseline and candidate runs against the same
scenario matrix. Preserve backend ownership of authorization, cancellation, version checking
and idempotency. Treat reduced consumer coupling as a hypothesis until the application diff
and scenario outcomes establish it.

No new adapter or workflow engine follows from this demo. A form adapter becomes a candidate
only if the pilot repeatedly exposes form-library-specific boilerplate that ordinary public
hooks cannot keep local. See [loading flags](./loading-flags) for simpler alternatives and the
[editorial plan](./index) for suggested distribution after review.
