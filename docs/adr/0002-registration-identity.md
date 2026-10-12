# Preserve explicit registration identity and separate operation labels

Accepted on 2026-10-12 for ticket 27. Defer automatic identity for manual hooks; retain explicit store-local IDs and existing diagnostics. A logical operation label describes work (for example, saving); a registration ID identifies one tracked lifetime. They must not become interchangeable through an automatic migration.

## Evidence and options

The [collision suite](../../packages/core/src/hooks/useActionBlocker/__tests__/useActionBlocker.collisions.test.tsx) covers repeated active owners, isolated Providers, activation/ID changes, Strict Mode and production behavior. In production, the second owner of the same ID replaces the first configuration; unmounting the first removes that registration. The warning is diagnostic, not reference counting or collision prevention. [Registration ownership](../../packages/core/src/hooks/useActionBlocker/useBlockerRegistration.ts) releases by ID. Explicit IDs must remain unique among independently owned registrations in one store.

| Option                                                              | Trade-off                                                                                                       | Decision                   |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Explicit IDs with unique owner suffixes or isolated Providers       | Caller owns uniqueness; existing imperative add/update/remove and diagnostics remain intelligible               | Retain                     |
| Automatic per-hook registration token plus separate operation label | Repeated owners cannot accidentally share a token; new return handle, metadata and cleanup semantics are needed | Defer                      |
| Reference-count identical logical names                             | Deliberate sharing becomes convenient; conflicting config, timeout and removal authority become ambiguous       | Reject as implicit default |

For two editors in one store, use distinct IDs such as `editor-a-save` and `editor-b-save`. Equal IDs in independent Provider stores are already supported. When deliberate named control is required, assign one application owner to the registration and let other participants address that ID imperatively; mounting independent manual hooks with the same name is unsafe. Scope expresses shared protection, not registration ownership.

[useAsyncAction](../../packages/core/src/hooks/useAsyncAction/useAsyncAction.ts) already allocates one ID per invocation, including concurrent calls with the same action label. The [allocator](../../packages/core/src/store/blockerId.utils.ts) uses a store-local sequence and checks current snapshot collisions. Query coordination also owns per-instance registration IDs. These are evidence of distinct ownership requirements, not evidence that every manual ID must change.

## Contract impact of a future token API

Provider changes must release the old store's owned token and register in the new store; unrelated owners must survive. ID changes, deactivation, unmount and Strict Mode setup/cleanup need the same isolation. Async executions keep their captured store until settlement, including after unmount, as covered by the [lifetime suite](../../packages/core/src/hooks/useAsyncAction/__tests__/useAsyncAction.lifetime.test.tsx); a token API must preserve that separate lifetime.

Devtools should display both the actual registration ID and any future operation label. Labels must not be fabricated from ID spelling or used as unique removal keys. Adding a label affects snapshot/event types and compatibility. Preserve explicit named add/update/remove and existing hook signatures; any new API should be opt-in with public-hook cleanup/collision regressions, typed consumer examples and a migration guide before a major removal is considered.

Reconsider when a real repeated-editor integration reports recurring uniqueness/cleanup defects despite owner-specific IDs or Provider isolation. Capture the conflicting owners and desired imperative controls, then write a separate bounded spec comparing an explicit handle with automatic tokens. The current production collision test proves a limitation; external incident frequency and migration benefit are unmeasured. No implementation follow-up is authorized by this decision.
