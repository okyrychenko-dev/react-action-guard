---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-ui": patch
---

Keep scoped metadata and guarded controls stable when unrelated blockers change, while observing all relevant metadata and preserving immutable priority-ordered results. Core `useBlockingInfo` now also accepts readonly scope arrays so UI consumers share the same projection and matching rules. Delegate resolved subscriptions and selection retention to react-zustand-toolkit, with optional custom equality on `useResolvedValue`. Retain production/development scale and rapid-registration benchmark evidence.
