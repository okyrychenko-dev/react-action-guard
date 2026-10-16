---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-devtools": patch
---

Finalize performance lifetimes on timeout and bulk cleanup, preserve timing through scope updates, and isolate slow-block callback failures. Keep Devtools history durations accurate after scope changes and preserve global registrations during targeted cleanup.

Preserve replacement registrations created inside timeout callbacks using opaque lifecycle registration identities; stale timeout events finalize only the expired lifetime.

Snapshot tracked scopes in performance and Devtools diagnostics so caller-owned array mutations cannot prevent scoped cleanup.
