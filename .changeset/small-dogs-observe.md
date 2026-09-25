---
"@okyrychenko-dev/react-action-guard": minor
"@okyrychenko-dev/react-action-guard-devtools": patch
---

Expose anonymous, ownership-safe lifecycle event observation through global and provider-scoped stores. Provider middleware and automatic Devtools observation now use release leases without registry names, while legacy named middleware remains available for compatibility and runs without awaiting earlier observers.
