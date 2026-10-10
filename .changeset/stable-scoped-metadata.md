---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-ui": patch
---

Keep scoped metadata and guarded controls stable when unrelated blockers change, while observing all relevant metadata and preserving immutable priority-ordered results. Core `useBlockingInfo` now also accepts readonly scope arrays so UI consumers share the same projection and matching rules; `createTypedHooks` accepts the same arrays while rejecting unknown scope names. Delegate resolved subscriptions and selection retention to react-zustand-toolkit, with optional custom equality on `useResolvedValue`. Cover scope representation changes and stable metadata when observation expands. Retain production/development scale and rapid-registration benchmark evidence.
