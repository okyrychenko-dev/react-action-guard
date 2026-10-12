---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-tanstack": patch
---

Apply current reactive blocker configuration in core and TanStack hooks. Removed
scope, reason and priority values return to defaults; omitted timeout and callback
values clear. Metadata changes preserve unchanged deadlines and registration
timestamps, while changed timeouts restart and removed timeouts cancel timers.
Imperative updateBlocker patch behavior remains compatible. Consumers relying on
retained hook options must keep those options in the current configuration.
The released TanStack adapter requires Core ^2.0.0, including configuration replacement support.
