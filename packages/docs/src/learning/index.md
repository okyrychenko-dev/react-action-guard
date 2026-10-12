# Practical coordination materials

These three editorial drafts explain when temporary interaction coordination helps and
when a simpler state model fits. They are available for review in this documentation site;
no external article or social post has been published.

1. [When loading flags cross feature boundaries](./loading-flags): start with local state,
   then compare Context, mutation observation and shared scopes.
2. [Coordinate conflicts without stopping every interaction](./conflicting-actions): define
   a conflict matrix, explain reasons and keep unrelated controls available.
3. [A revision workflow: demonstration and pilot plan](./revision-case-study): reproduce a
   user/agent example and distinguish its evidence from a real application evaluation.

The [pilot integration and measurement plan](./workflow-pilot) records the missing application
prerequisite, baseline capture, scenarios and decision gates. Existing runnable examples are
linked from each draft; checkout instructions use workspace or locally packed packages rather
than claiming behavior of an arbitrary published version.

## Editorial and distribution plan

| Draft               | Intended reader                                                    | Suggested channel after review                                            | Evidence to retain                                                     |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Loading flags       | React developer with one pending button becoming several consumers | Team engineering note or a technical article                              | Runnable core example, comparison assumptions, version/commit          |
| Conflicting actions | Feature owner defining cross-feature policy                        | Documentation tutorial or a short demo walkthrough                        | Conflict matrix, visible reasons, success/failure/cleanup observations |
| Revision workflow   | Application team considering a pilot                               | Internal architecture review first; public case study only after approval | Demo provenance now; anonymized real baseline and outcomes later       |

Before distributing, run the documented checks, review accessibility and terminology,
replace proposed outcomes with measured data only when available, and obtain the application
owner's approval for sharing application details. Keep source links and limitations next to
claims. No distribution scheduling or external posting is included here.

Continue with [workflow design](../guides/workflows) or the [Core contract](../packages/react-action-guard/contract).
