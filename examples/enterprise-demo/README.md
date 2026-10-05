# React Action Guard Enterprise Demo

Sellable enterprise checkout/admin template for
`@okyrychenko-dev/react-action-guard`.

This example is maintained as a regular directory in the main repository. It demonstrates how the
library prevents duplicate submits, conflicting admin actions, stale navigation,
and invisible async state bugs in a realistic operational workflow.

## Run

```bash
npm ci
npm run setup:local -- /absolute/path/to/react-action-guard
npm run dev
```

## Verify

```bash
npm run test
npm run build
```

## What It Shows

- `useAsyncAction` for save cart, coupon, and place order flows.
- `useIsBlocked` for checkout, payment, inventory, and navigation guards.
- `useBlockingInfo` for a live priority-sorted blocker inspector.
- `useActionBlocker` for unsaved edits and manual operations locks.
- `useConfirmableBlocker` for destructive refund approval.
- `useScheduledBlocker` for a timed maintenance window.
- `useConditionalBlocker` for risk and inventory constraints.
- `UIBlockingProvider` for isolated app state.
- `createTypedHooks` for typed enterprise scopes.
- Provider-local lifecycle observation for the audit event log.

## Positioning

Use this as a portfolio and sales asset for enterprise teams that need reliable
React workflows around async actions, operational controls, and cross-component
UI blocking.

See [Evaluated workflows](WORKFLOWS.md) for package provenance, isolated reset ownership,
query/refund/payment behavior, and reproducible Chrome verification.
