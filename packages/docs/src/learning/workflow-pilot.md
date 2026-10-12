# Revision editor pilot: integration and measurement plan

Status: integration plan; external application prerequisite open. No authorized real application
repository or backend was supplied. The fallback deliverable is this concrete plan, not a claim
that a production pilot was completed. The accessible reference is the existing
[revision demonstration](./revision-case-study), whose local behavior can be reproduced now.

## Target and constraints

Choose one application-owned editor with a property value, monotonically versioned revision,
explicit save and recalculation. A user and an optional agent entry point can initiate conflicting
changes. The application owner must provide repository access, a non-production environment,
a test account, reproducible save/recalculate APIs and approval of the conflict policy below.
Record the application commit, package versions, owner and environment before implementation.
Do not infer a real application from this repository's simulated checkout.

| Producer             | Current baseline to capture                                        | Candidate declaration                                            | Consumers                                                            |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Save revision        | Save pending state and every place reading it                      | `property`, `revision`; navigation only if the owner requires it | Property editor, save control, optional navigation adapter           |
| Recalculate          | Pending state, input snapshot and completion handling              | `property`, `revision`, `recalculation`                          | Editor, save, recalculate, agent-start control                       |
| Apply agent proposal | Entry permission, pending state, cancellation and stale completion | Same three scopes                                                | Same conflicting controls                                            |
| Unsaved edits        | Dirty tracking and current navigation policy                       | Separate `navigation` registration if needed                     | A supported router adapter; scopes alone do not intercept navigation |

Read-only help observes `help`. Exact labels are deliberate; no dotted-name hierarchy is inferred.
The save declaration is a starting policy to approve with the owner, not observed application behavior.

## Capture the baseline before replacing conditions

Inventory each producer entry point, each affected control, its availability expression, the
state transport path (props, Context or mutation observation), reason display and cleanup owner.
Capture a code reference for each row and keep the original implementation in a comparison commit.
Run the same scripted scenarios before and after with fixed API responses, delay and settlement order.
Count policy expressions by source location, rather than counting every reference to a shared helper.
Do not count backend checks or ordinary progress/result state as removable guard boilerplate.

| Metric                 | Definition and collection                                                                                | Before       | Candidate    | Acceptance gate                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------ | ------------ | ------------------------------------------------------------------------------ |
| Consumer coupling      | Distinct operation pending fields imported/passed/read by availability consumers; retain file references | Not measured | Not measured | Reduced coupling without hiding required progress/result state                 |
| Policy duplication     | Independently maintained conflicting-action expressions across consumers                                 | Not measured | Not measured | No increase; explain any remaining duplicate policy                            |
| Cleanup defects        | Controls erroneously open or still blocked after each terminal scenario                                  | Not measured | Not measured | Zero in both candidate runs; baseline failures recorded without invented rates |
| Unrelated availability | Help/read-only scenarios available while each operation is pending                                       | Not measured | Not measured | Every scenario remains available unless an explicit global policy applies      |
| Entry exclusion        | Accepted conflicting starts in repeat/programmatic-start cases                                           | Not measured | Not measured | Only the application-approved number accepted                                  |
| Change cost            | Files and lines changed for adding one new producer, measured from comparison diffs                      | Not measured | Not measured | Record tradeoff; no numerical improvement promised                             |

Store scenario results, screen recordings where permitted, diffs and timestamps in the application's
pilot report. Use two repeat runs to detect order-dependent behavior; small samples cannot establish
production failure rates or performance improvements. Report adverse results as well as successes.

## Integrate one vertical slice

1. Put one `UIBlockingProvider` at the shared workflow boundary. Keep unrelated sessions isolated.
   Decide whether an operation survives route unmount; a Provider replacement ends that store's visibility.
2. Keep the original execution and backend checks. Add one save producer through `useAsyncAction`
   if pending work should outlive its initiating component, or a mounted `useActionBlocker` if
   application-owned pending state and detach cleanup are the chosen contract. Use the Query adapter
   when the actual operation is a mutation and its execution contract fits.
3. Move one independent consumer to `useIsBlocked` or a UI guarded hook, and its explanation to
   `useBlockingInfo`. Preserve progress/error rendering from the operation's native state.
4. Check success, rejection and detach at the public rendered workflow seam. Then migrate the other
   conflicting consumers and add recalculation/agent producers one at a time. Keep registration IDs
   unique in the store and use supported public exports; no internal maps or separate event bus.
5. Retain a synchronous application entry gate for repeated clicks and programmatic starts. Attach
   cancellation to the operation, not to clearing a blocker. Reject stale results against the
   captured revision, and retain server authorization, revision checks and idempotency keys.
6. Rerun the baseline matrix, compare evidence and decide whether the added ownership model pays
   for itself. Revert the interaction-policy slice if it adds complexity without measured benefit.

Use existing `type-utils` guards for optional operation state and exhaustive outcome handling.
When imperative store access is needed, destructure `isBlocked` from `store.getState()` before
calling it. Do not cast partial payloads to production types or chain access from `getState()`.

## Scenario matrix and expected candidate outcomes

| Scenario                                     | Expected observable result                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Save/recalculate succeeds                    | Conflicting controls wait; accepted revision appears; protection releases                                              |
| Request rejects, then retry                  | Error shown; protection releases; approved retry can start                                                             |
| Cancel                                       | Application cancellation acknowledged or explicitly remains pending; late completion cannot overwrite a newer revision |
| Repeated click or programmatic entry         | Application gate excludes conflicting execution even before React rerenders                                            |
| Concurrent permitted calls settle in reverse | Protection follows the selected execution lifetime; stale results are rejected independently                           |
| Producer detaches                            | Chosen mounted/pending-operation contract is honored; no abandoned protection or accidental early release              |
| Route/session resets                         | Old completion cannot mutate the new editor; observation belongs to the correct store                                  |
| Timeout while request continues              | Protection may release; work is not assumed cancelled; entry/backend checks still protect writes                       |
| Read-only help during each producer          | Help stays usable and communicates no write capability                                                                 |
| Navigation with unsaved edits                | Approved real-router confirmation policy is observed; revision scopes alone make no promise                            |

These scenarios are proposed for the real application's public UI with real router/Query
composition where used. Confirm that application's testing seam with its owner before adding tests.
Current repository tests verify the demonstrator only; they do not establish these backend outcomes.

## Decision and follow-up gates

At present the repository examples show independent consumers sharing availability and reasons,
including failure/retry and selected cleanup paths. The real baseline, complexity benefit and
server-correctness outcomes remain unknown. The next prerequisite is an accessible authorized
application, not a new package. Keep local state/Context/native mutation observation if the workflow
stays simple. Consider a form integration only after repeated, measured form-specific boilerplate;
do not infer demand for React Hook Form, SWR, XState or Formik from this simulation.

Close the integration evaluation with an owner-reviewed report listing measured benefits,
regressions, remaining predicates and a keep/revert decision. The plan portion can be delivered
now; execution remains an explicit external follow-up. See the [case study](./revision-case-study)
and [distribution guidance](./index) for accurate evidence boundaries.
