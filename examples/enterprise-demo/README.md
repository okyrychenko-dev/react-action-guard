# React Action Guard — Enterprise Demo

An interactive checkout and admin application demonstrating
`@okyrychenko-dev/react-action-guard`. It is maintained as a regular directory
in the main repository. Payment and finance operations are simulated; no backend is required.

The app simulates a multi-team operational environment where async operations,
admin controls, and concurrent user actions need to coordinate without conflicts.
Guard hooks and UI adapters connect scoped blocking state to buttons and fields.
The router adapter handles confirmation when leaving unsaved Checkout changes.

## Run

From the repository root, with Node.js 22+, npm, and the repository's configured pnpm version:

```bash
cd examples/enterprise-demo
npm ci
npm run setup:local
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).
`setup:local` defaults to the repository at `../..`. To use another source checkout:

```bash
npm run setup:local -- /absolute/path/to/react-action-guard
```

The lockfile installs the published baseline. `setup:local` builds and installs packed
current-source packages without changing the demo manifest or lockfile. Rerun it after
`npm ci` or `npm install`, and restart Vite after replacing artifacts. Package provenance
is recorded in `.cache/local-packages/evidence.json`.

## Verify

After `setup:local`:

```bash
npm run test:imports
npm run check
npm run test:browser
npm run build
```

`check` runs TypeScript, lint, formatting, and unit/component tests. The browser suite
requires installed Google Chrome and checks navigation confirmation, browser history,
and responsive onboarding at 390, 820, and 1440 pixels. Formatting inherits the root
`prettier.config.mjs`.

## What It Demonstrates

This demo is designed around workflows where a single operation can affect
multiple parts of the UI at once: checkout saves, payment holds, inventory
syncs, admin actions, navigation guards, and cross-page operational controls.

The goal is to show how blocking state can become an application-level contract
instead of scattered button-level conditionals.

### Blocking patterns

| Pattern                      | Hook                                | Where                                               |
| ---------------------------- | ----------------------------------- | --------------------------------------------------- |
| Async action with scope lock | `useAsyncAction`                    | Checkout — Save Cart, Apply Coupon, Place Order     |
| Conditional blocker          | `useConditionalBlocker`             | Checkout — Risk hold, Inventory reservation         |
| Timed blocker                | `useScheduledBlocker`               | Admin — Maintenance window                          |
| Confirmable blocker          | `useConfirmableBlocker`             | Admin — Refund approval with dialog                 |
| Navigation blocker           | `useActionBlocker` + router adapter | Checkout — Unsaved changes guard                    |
| Query blocker                | `useBlockingQuery`                  | Integrations — Inventory sync, gateway health check |
| Mutation blocker             | `useBlockingMutation`               | Integrations — Price update, Order export           |

### System features

- **Typed scopes** via `createTypedHooks` — six enterprise scopes: `global`, `checkout`, `payment`, `inventory`, `admin`, `navigation`
- **Priority resolution** — the inspector ranks blockers by priority; any active matching blocker can block an action
- **Scope coordination** — Dashboard presets and maintenance affect other routes in the same session; route-owned checkout blockers release on unmount
- **Provider-local lifecycle audit log** — blocker lifecycle events, including `add`, `update`, `remove`, `timeout`, `clear`, and `clear_scope`, are captured and displayed in the live Guard Inspector panel
- **Isolated store** via `UIBlockingProvider` — blockers, audit events, query caches, and order notifications belong to the current demo session

## Start with four experiments

The Dashboard guide gives instructions and expected results:

1. **Protect unsaved changes.** Open Checkout, edit the shipping address, and choose
   another page. **Stay and save** keeps you in Checkout; **Leave anyway** confirms
   navigation. Save the cart to clear the dirty state.
2. **Watch an action in progress.** Save the cart, then place an order. Follow the
   affected scopes and blocker lifecycle in the live guard inspector.
3. **Compare isolated sessions.** Open a second demo tab using the guide's link.
   Enable a risk hold in one tab; the other session remains independent.
4. **Recover from a slow payment.** Enable **Slow gateway**, place an order, and
   use **Cancel pending**. Turn off Slow gateway and try again. Blocker timeout
   releases the blocker; cancelling the pending operation is a separate action.

**Reset demo** starts a fresh provider and query cache for the current session and
aborts pending work. On small screens, navigation remains available and the inspector
moves below the page content. The inspector can be collapsed at any screen size.

## Explore scope coordination

Apply the Dashboard's **High-risk checkout** preset, then visit Orders or Settings
to observe their guarded controls. Clear the preset from Dashboard when done.
Presets remain active across routes in the same session. Route-owned Checkout blockers,
such as Risk hold, are released when Checkout unmounts.

## Pages

| Page             | Demonstrates                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| **Dashboard**    | Guided experiments, live metrics, scenario presets, scope health grid            |
| **Checkout**     | Full order flow with 5 simulation toggles, operation timeline, navigation guard  |
| **Admin**        | Maintenance window, team member lock, confirmable refund, scope clear controls   |
| **Orders**       | Cross-scope button disabling (Void / Refund guarded by checkout + payment)       |
| **Settings**     | Form fields auto-locked by scope (Company Profile → checkout, Payment → payment) |
| **Integrations** | TanStack Query integration — blocking queries and mutations per scope            |
| **Team**         | Concurrent lock simulation with priority leaderboard for the checkout scope      |

## Stack

- React 19, TypeScript, Vite
- React Router 7 (navigation blocking)
- TanStack Query 5 (blocking queries and mutations)
- Zustand (guard store foundation)
- Tailwind CSS 4, HeroUI (UI components)
- Vitest + Testing Library + Playwright (tests)

## Positioning

Use this as a portfolio and sales asset for enterprise teams that need reliable
React workflows around async actions, navigation blocking, operational controls,
auditability, and cross-page UI coordination.

It is intentionally built as a realistic product surface rather than a minimal
hook playground, so reviewers can evaluate how React Action Guard behaves under
the kinds of overlapping actions and permissions common in enterprise apps.

See [Evaluated workflows](WORKFLOWS.md) for package provenance, isolated reset ownership,
query/refund/payment behavior, and reproducible Chrome verification.
