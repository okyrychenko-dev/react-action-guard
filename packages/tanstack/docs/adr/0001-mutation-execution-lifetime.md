# Protect all mutation calls owned by a hook

Status: accepted contract; implemented by the mutation execution owner.

Decision date: 2026-10-08. Evidence baseline: repository `055e7ba`;
installed `@tanstack/react-query` and `@tanstack/query-core` 5.90.10.

`useBlockingMutation` protects all unsettled calls initiated through its
`mutate` and `mutateAsync` functions. Its returned result continues to describe
the latest native mutation observer. These are separate responsibilities: result
observation, protection lifetime, and operation cancellation must not be confused.
The original adapter followed only `mutation.isPending`; the execution owner now
accounts for each native execution promise independently.

## Alternatives and selected boundary

| Contract                          | A starts, B starts, B completes first                | Trade-off                                                                       |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Latest observer, current behavior | Result shows B; protection ends while A runs         | Simple, but misses unfinished work initiated by the same hook.                  |
| All owned calls, selected         | Result shows B; protection remains until A completes | Requires execution ownership independent of observation and component lifetime. |

An owned call is an invocation of this hook's returned mutation functions. It
begins before delegation to native execution and ends when the native execution
promise settles, whether fulfilled or rejected. Retries, offline pauses, and calls
queued by a native mutation scope remain unsettled. We do not track unrelated
cache entries, direct cache executions, persisted mutations restored without a
live wrapper invocation, or calls from another hook with the same mutation key.
Blocking neither serializes calls nor prevents programmatic invocation.

Native execution includes awaited MutationCache and hook-option callbacks:
`onMutate`, success/error processing, and `onSettled`. It includes synchronous
terminal observer notifications. A callback throw can change the execution's
outcome; cleanup must follow the actual returned promise, not the mutation
function alone or an `onSettled` wrapper. Promises returned by per-call callbacks
are ignored by native Query and remain outside the protection lifetime. We do not
await them or create callbacks that native Query would have suppressed. [1][2][3]

## Lifetime rules

| Event                                           | Required behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mutate(variables, options)`                    | Register ownership before delegating; preserve a void return and native rejection consumption. Pass per-call options through unchanged.                                                                                                                                                                                                                                                                                                                           |
| `mutateAsync(variables, options)`               | Same ownership; return the original native promise with its original data or rejection. Preserve generic types and inference.                                                                                                                                                                                                                                                                                                                                     |
| Another call starts or finishes                 | Each invocation completes only its own ownership token. B cannot release A. Callback reentrancy can start C without transiently releasing outstanding protection.                                                                                                                                                                                                                                                                                                 |
| Awaited callbacks                               | Keep protection through every callback phase that native execution actually awaits, including rejection paths. Do not duplicate or reorder callbacks, or normalize native exception behavior.                                                                                                                                                                                                                                                                     |
| `reset()`                                       | Preserve native idle result/reset identity. Clear observer-derived error protection; retain every unsettled owned call. Reset does not cancel work.                                                                                                                                                                                                                                                                                                               |
| Unmount                                         | Detach result observation normally. Retain pending-call protection in its originating blocking store until settlement or blocker timeout, matching core `useAsyncAction`. Remove error-only protection on detach; the detached owner must not create a new error blocker.                                                                                                                                                                                         |
| Retained mutation function invoked after detach | Preserve native invocation behavior; use the originating owner and its last committed blocking configuration without restoring a result observer.                                                                                                                                                                                                                                                                                                                 |
| Terminal rejection                              | Release that call's token even when an error or settlement callback throws. With `onError` omitted/false, release protection when the final call settles.                                                                                                                                                                                                                                                                                                         |
| `onError: true`                                 | While attached, retain error protection from the latest native observer's `isError`, never from an aggregate history of failures. Pending ownership takes precedence for reason selection. Reset or a subsequent native non-error result clears error protection; an older call's settlement cannot rewrite the observed result.                                                                                                                                  |
| Blocking configuration changes                  | While attached, apply the latest committed scope, priority, reason, timeout, and onTimeout to this owner's outstanding protection, including removal of optional values. Freeze that blocking configuration at detach. Native mutation-option updates retain Query's own rules; do not freeze user mutation callbacks.                                                                                                                                            |
| `mutationKey` changes                           | Preserve native result-reset/options behavior, but keep ownership of previously initiated calls. A key names native mutation configuration, not execution ownership.                                                                                                                                                                                                                                                                                              |
| Blocking store changes                          | Keep old pending work in its originating store with its detached configuration. Future invocations use a new owner in the newly resolved store. Pending accounting and registration episodes stay owner-local; latest-call/error observation is shared across owners bound to the same native observer. Retained calls and resets update the attached owner's observation without transferring pending work. Never transfer or remove another owner's protection. |
| QueryClient argument/provider changes           | Preserve native observer binding. In 5.90.10, rerendering with a different client does not rebuild the existing observer. To actually use another client, remount a new hook; do not claim client migration. [3]                                                                                                                                                                                                                                                  |

Each hook/store owner exposes one aggregate blocker while it has pending calls or,
while attached, an eligible latest-observer error. Independent hook instances
remain independent even with equal keys, equal scopes, or an intentionally shared
MutationCache. Independently mounted clients do not borrow pending accounting
from each other. Calls still use the client selected by their native observer. [4]

## Timeout and registration episodes

A registration episode begins when an owner's protection predicate changes from
false to true: it has unsettled calls, or attached observer-derived error
protection. Its timeout is a bound on that episode's blocker, not on any operation.
Native retries and pauses do not reset it. Additional calls during the same
episode do not reset it either.

When the timeout fires, remove the blocker and notify the current `onTimeout`
once. Keep execution ownership until actual settlement. An expired episode must
not re-register on rerender, metadata changes, another call, reset while calls
remain pending, or the transition from pending work to eligible error protection.
The episode ends only when its protection predicate becomes false; a later
false-to-true transition can begin a fresh episode. Error-only detach ends its
episode. Pending detach leaves its episode and deadline in place.

Before expiry, preserve the core blocking lifecycle's reactive timeout semantics:
changing timeout restarts its timer from the update, removing timeout cancels it,
and metadata-only changes retain the deadline. After expiry, configuration updates
do not revive the episode. Timeout callbacks may themselves initiate mutations;
such calls join the still-expired episode if other coverage remains. Neither
timeout nor reset aborts a request, settles a promise, rolls back a mutation, or
provides backend exclusion. [5]

## Compatibility and implementation constraints

The feasible public boundary is native `mutateAsync`: allocate an ownership token,
delegate once, attach a nonthrowing fulfillment/rejection cleanup branch, and
return the original promise. `mutate` can use the same execution path with native
void/rejection handling. This implementation boundary was selected from
exact-version native source. A token also needs cleanup if delegation
throws synchronously. Do not alter mutationFn, options, meta, MutationCache,
callbacks, or observer subscription to recover execution identity. [2][3]

One native `MutationObserver` belongs to the hook. A small React adapter follows
TanStack's client binding, option updates, batched subscription, result snapshots
and `throwOnError` rules through its public interfaces. Blocking owners read that
observer's current error state; they do not reconstruct latest-call selection from
invocation tokens, cache notifications or Promise outcomes. No extra subscription
to the native observer is added for blocking observation.

A synchronous delegation failure therefore preserves the native observer's prior
result snapshot. Later completion of a detached mutation releases its own pending
ownership and cannot manufacture an observed error.

Do not discard a rejected `.finally` promise: an ignored derived rejection can
introduce an unhandled rejection absent from native `mutate`. Blocking maintenance
must not replace a native result or error. Preserve native `throwOnError`, callback
arguments, latest-call callback suppression, and option-update behavior. Query
updates the currently observed pending mutation's options; older detached calls
retain their native execution options. [1][2][3]

Retaining protection after unmount is a deliberate change from the original
mutation adapter's component-owned registration. An indefinitely paused or
unfinished call can retain protection indefinitely without a configured timeout,
just as core async-action tracking can. An expired episode can admit new work
without renewed protection until all covered pending/error state clears. These
trade-offs need explicit user documentation in the package README.

The contract is feasible against the installed 5.90.10 public API, but this does
not establish compatibility throughout the declared `^5.90.10` peer range. The
implementation must prove the behavior with real QueryClient tests and applicable
fresh packed consumers. If promise ownership, detached lifetime, callback semantics,
types, or timeout suppression cannot be preserved safely, stop and record a
follow-up decision; do not silently fall back to latest-observer protection.

## Executed evidence and implementation verification

On 2026-10-08, three temporary public-hook characterization probes passed against
the unchanged adapter and real QueryClient:

- Deferred A/B: after B fulfilled, the result was B and the scope was unblocked
  while A remained unsettled. A's later completion did not replace B's result.
- A deferred hook-option `onSuccess` kept protection pending; after it completed,
  `mutateAsync` fulfilled even while the per-call `onSuccess` promise remained
  unsettled.
- Reset produced idle observation and released protection during an unfinished
  call. After reset and unmount, the original promise still fulfilled.

These are baseline observations, not passing tests of the future contract. The
temporary probes were removed from the runtime suite and are not part of the
committed artifact; source-backed conclusions above remain reviewable.

Existing mutation/coordination suites passed 28 tests; the core async-action
lifetime suite passed 2 tests, independently establishing retention after caller
unmount and timeout without operation settlement. [5] Final workspace typechecking passed; the full suite passed 790 tests. The ADR
passed Prettier and staged whitespace checks. Build, packed consumers, and browser
checks were not run for this documentation-only change. Those decision probes
delivered no production behavior or permanent runtime tests.
The implementation is verified separately through the public-hook lifetime suite.

Implementation verification uses the public-hook seam with real QueryClient, deferred
promises, supported blocking observations, and controlled time only for timers.
Coverage includes reversed settlement with both invocation methods; reset and unmount with
unfinished work; awaited option/cache callbacks and ignored per-call promises;
callback throws/rejections and native suppression; retries and queued/paused
work; reactive configuration/key/store changes; timeout expiry and rearming;
independent hook/client ownership; and generic result/callback types. Registration
checks verify blocker existence before metadata assertions; client changes verify
remount behavior rather than assuming client-prop migration.

Implementation verification completed on 2026-10-08 through the
[public-hook lifetime suite](../../src/hooks/__tests__/useBlockingMutation.lifetime.test.tsx):

- 25 lifetime scenarios passed, including reversed completion, native callbacks,
  reset/detach, key/configuration changes, retry/pause/queue, isolation,
  callback reentrancy, committed layout configuration and timeout episodes.
- Query and Mutation registration checks require blocker existence before metadata.
- Workspace build, lint, typechecking and all 815 tests passed.
- Fresh strict-peer packed Query 5.90.10 and 5.104.1 consumers passed ESM/CJS imports,
  NodeNext .mts/.cts mutation variable/result/callback types and three runtime
  scenarios each. Versioned results are in the
  [compatibility evidence](../../../../scripts/compatibility/evidence.json).
- Standards and Spec reviews had no findings. Other packed targets and browser
  suites were not rerun.

- A shared-observer follow-up uses the approved execution-owner integration seam
  with one real MutationObserver and two Provider stores. It covers stale rejection
  suppression, retained-call error propagation/reset, duplicate/foreign completion,
  reentrant delegation and reset during another owner's pending work. Public-hook
  checks preserve synchronous delegation errors and isolate separate native observers.

- The native-observer implementation passed 831 workspace tests, typechecking,
  linting and build. Fresh Query 5.90.10 and 5.104.1 packed consumers passed
  imports, declarations and seven runtime cases each, including cache-added
  reentrancy and synchronous failure snapshots. Native error-boundary checks
  preserve predicate/client defaults and original non-Error values with ESLint
  rules enabled. Other packed/browser targets were not rerun.

## Sources

1. Official [mutation guide](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
   and [useMutation reference](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation):
   consecutive calls, callbacks, reset, retries, and mutation scopes. Current
   documentation is corroboration; exact-version claims use installed sources.
2. Query Core 5.90.10 [Mutation.execute](https://unpkg.com/@tanstack/query-core@5.90.10/src/mutation.ts)
   and [MutationObserver](https://unpkg.com/@tanstack/query-core@5.90.10/src/mutationObserver.ts).
3. React Query 5.90.10 [useMutation](https://unpkg.com/@tanstack/react-query@5.90.10/src/useMutation.ts).
4. Query Core 5.90.10 [QueryClient](https://unpkg.com/@tanstack/query-core@5.90.10/src/queryClient.ts)
   and [MutationCache](https://unpkg.com/@tanstack/query-core@5.90.10/src/mutationCache.ts).
5. Repository [useAsyncAction](../../../core/src/hooks/useAsyncAction/useAsyncAction.ts),
   [lifetime tests](../../../core/src/hooks/useAsyncAction/__tests__/useAsyncAction.lifetime.test.tsx),
   and [blocking lifecycle](../../../core/src/store/blockingLifecycle/blockingLifecycle.ts).

Exact-version upstream files were read from installed package `src/` directories;
remote versioned-source fetches were unavailable during investigation. Versioned
links identify the same published sources. The current adapter and its tests are
in [useBlockingMutation](../../src/hooks/useBlockingMutation.ts) and
[mutation tests](../../src/hooks/__tests__/useBlockingMutation.test.tsx).
