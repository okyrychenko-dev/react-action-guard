---
"@okyrychenko-dev/react-action-guard-router": patch
---

Settle pending custom confirmation dialogs as false on effect teardown, including unmount and hiding a preserved React Activity subtree. Clear preserved dialog state so it cannot reappear after effects reconnect. Dialog-specific resolvers now close their own dialog exactly once and cannot affect a replacement dialog. Stable hook-level controls continue to act on the current dialog.
