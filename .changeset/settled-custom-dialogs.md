---
"@okyrychenko-dev/react-action-guard-router": patch
---

Settle pending custom confirmation dialogs as false on unmount. Dialog-specific resolvers now close their own dialog exactly once and cannot affect a replacement dialog. Stable hook-level controls continue to act on the current dialog.
