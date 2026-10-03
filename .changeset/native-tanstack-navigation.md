---
"@okyrychenko-dev/react-action-guard-router": minor
---

Restore TanStack navigation blocking using native useBlocker. Confirmed transitions keep protection armed, failed confirmations deny navigation, and superseded or unmounted attempts cannot allow navigation. Require TanStack Router >=1.170.41 within v1, the verified compatibility floor, and use native unload protection with a one-shot bypass after accepted document navigation, avoiding a duplicate browser prompt.

Invalidate pending confirmations when when or scope changes, including replacements that leave the computed blocking state active.
