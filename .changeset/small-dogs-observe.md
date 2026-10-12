---
"@okyrychenko-dev/react-action-guard": minor
"@okyrychenko-dev/react-action-guard-devtools": patch
---

Expose anonymous, ownership-safe lifecycle event observation through global and provider-scoped stores. Provider middleware and automatic Devtools observation use release leases without registry names. Core 2.0 removes the intermediate named middleware and direct runMiddlewares compatibility APIs; use observeBlockingEvents and release its lease to detach.

Observers registered while an event is being delivered begin receiving events with the next delivery. Observers released before their turn are skipped. Observer delivery remains ordered and error-isolated without awaiting earlier observers.

Manual Devtools observation is additive and store-local. Releasing an observation lease does not remove another owner's observer.
