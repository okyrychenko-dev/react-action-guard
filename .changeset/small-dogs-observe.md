---
"@okyrychenko-dev/react-action-guard": minor
"@okyrychenko-dev/react-action-guard-devtools": patch
---

Expose anonymous, ownership-safe lifecycle event observation through global and provider-scoped stores. Provider middleware and automatic Devtools observation now use release leases without registry names, while legacy named middleware remains available for compatibility and runs without awaiting earlier observers.

Observers registered while an event is being delivered begin receiving events with the next delivery, preventing self-replacing named middleware from processing the same event twice.

Observers released before their turn in an event are skipped, and replacing named middleware keeps its original delivery position.
