# Keep telemetry consumers on Blocking lifecycle observation

Accepted on 2026-10-12. Use application-owned telemetry recipes over the existing Blocking lifecycle observation interface. Retain all existing Core analytics exports and defer their removal: repository consumers demonstrate a need for store-local diagnostics, but provide no evidence that a new package or subpath would justify a public import migration.

## Available events and producers

`BlockingEvent` is the existing `MiddlewareContext`, not a second schema. The authoritative producer is [Blocking lifecycle](../../packages/core/src/store/blockingLifecycle/blockingLifecycle.ts); [public types](../../packages/core/src/store/blockingLifecycle/blockingLifecycle.types.ts) expose observation without transition authority.

| Event         | Actual producer behavior                                   | Payload / interpretation                                                                                                        |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `add`         | Registration, including replacement of an existing ID      | ID, event timestamp and supplied scope/reason/priority/timeout; omitted fields are not normalized snapshot defaults             |
| `update`      | Patch or reactive replacement of an existing registration  | Current config and previous config; update of an absent ID emits `add`                                                          |
| `remove`      | Removal of an existing blocker, including timeout cleanup  | Current/previous config; not proof of user approval or operation success                                                        |
| `timeout`     | Expired owned registration after its current callback runs | Scope/reason/priority/timeout; normally followed by `remove`, unless the callback/observer replaces or removes the registration |
| `clear`       | Non-empty clear-all transition                             | `blockerId: "*"`, removed count; no individual remove events                                                                    |
| `clear_scope` | Targeted clear that actually removed registrations         | Target scope and count; global blockers are excluded by target-clear semantics                                                  |

Event timestamps describe transitions. Blocker timestamps in immutable snapshots describe the configured start time, which can be supplied or updated. Snapshot subscriptions and event observation serve different purposes; attaching a consumer does not synthesize historical events. Observer throws and rejected promises are isolated by the lifecycle; synchronous work still delays the caller.

## Actual consumers and evidence

- Core [logger](../../packages/core/src/middleware/loggerMiddleware.ts), [performance](../../packages/core/src/middleware/performanceMiddleware.ts) and [analytics](../../packages/core/src/middleware/analyticsMiddleware.ts) consume this vocabulary. Analytics adapts GA/Mixpanel/Amplitude browser globals or a custom callback, without a vendor SDK dependency. Its legacy payload flattens array scopes and omits event timestamp, previous config and clear counts; it is not a complete event serialization.
- [configureMiddleware](../../packages/core/src/middleware/configureMiddleware.ts) owns replaceable global leases. Provider initial middleware and `store.getState()`'s `observeBlockingEvents` support store-local consumers; each independent lease has its own idempotent release.
- Devtools [automatic acquisition](../../packages/devtools/src/components/actionGuardDevtools/acquireDevtoolsMiddleware.ts) shares one observer/history per store's Observation session. [History middleware](../../packages/devtools/src/middleware/devtoolsMiddleware.ts) consumes native events; final participant detach releases automatic observation and discards runtime history. Independently acquired observers remain owned by their consumers.
- The enterprise demo's [audit log](../../examples/enterprise-demo/src/features/core/guard/hooks/useAuditLog/useAuditLog.ts) and [session metrics](../../examples/enterprise-demo/src/features/dashboard/session/useSessionMetrics.ts) already use store-local observation. The demo's [action rejection and order-placement events](../../examples/enterprise-demo/src/features/core/sessionEvents.ts) are application workflow events with actual application producers, not Core lifecycle events.
- Router confirmation callbacks and Core confirmable callbacks are local effects, not shared lifecycle event producers. Attempt, rejection, approval and cancellation telemetry would require a separately chosen producer at the action/confirmation boundary. Blocker removal cannot reconstruct those facts.

These are repository consumer observations, not measured external adoption or vendor demand. Existing lifecycle, analytics, observation-session and inspector suites provide executable contract evidence; exact commands/results are recorded in the release handoff.

## Options and decision

| Option                         | Benefit                                                                                                      | Cost / evidence                                                                                                    | Outcome                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| Consumer recipes               | Applications choose transport, redaction, scope representation and store ownership; no install/import change | Small application adapter; existing audit/metrics consumers already use this boundary                              | Selected for new integrations |
| Core subpath                   | Could isolate vendor helpers while keeping one package                                                       | New export/build/packed type contract; current root exports still need compatibility, no demonstrated bundle issue | Deferred                      |
| Separate observability package | Independent release and vendor adapter ownership                                                             | Peer/version/install matrix and migration overhead without repository demand for SDK integrations                  | Deferred                      |

The [canonical recipe](../../packages/docs/src/advanced/observability.md) implements the selected integration path in this batch. No runtime extraction follow-up is selected. Keep existing `createAnalyticsMiddleware` and its public types supported in the planned release; no deprecation or breaking removal is implied by this ADR. Reconsider when a real consumer needs a maintained adapter or measured bundle/release constraints justify it.

If extraction is selected later: **expand** with the chosen public entry and packed ESM/CJS/type consumer checks while keeping root compatibility; **migrate** canonical docs and real consumers with payload/event-name comparison, SSR, error isolation, cleanup and store isolation checks; **contract** only in an explicitly approved major release after migration evidence. Release timing is evidence-gated, with no removal date selected here. Do not couple inspector rendering to that hypothetical migration or add a parallel event bus.

## Inspector boundary

The inspector reads authoritative immutable snapshots. Source is unavailable because `BlockerInfo` has no provenance field. `inspection.actions` is an explicit application declaration, not a runtime action registry or attempted-action history. `inspection.scopes` names areas to display even when unaffected; neither changes blocking policy. The graph uses Core `scopeAffectsObservation`: exact shared names or a global blocker, no dotted-name hierarchy. An empty observed scope list remains unaffected even by global blockers. Declarations belong to a panel; simultaneous panels still share the store's existing Observation session.
