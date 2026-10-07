---
"@okyrychenko-dev/react-action-guard-router": patch
---

Use shared confirmation ownership in React Router so only the latest attached navigation attempt can proceed or notify permission. Invalidate pending answers when the evaluated protection state, scope, or message changes, while preserving them across callback rerenders and equivalent scopes.

Reset the current blocked transition and clear its pending confirmation when protection configuration changes, without resuming stale approvals or resetting superseding attempts.
