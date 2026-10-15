---
"@okyrychenko-dev/react-action-guard-router": patch
---

Evaluate pure navigation predicates on every React render, including stable functions reading refs or external state. Remove misleading useCallback guidance: changing a ref alone still requires a React rerender to refresh protection. Preserve scope OR semantics and router-specific navigation and unload capabilities.
