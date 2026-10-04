---
"@okyrychenko-dev/react-action-guard": patch
---

Warn in development when active useActionBlocker hooks share an ID in the same store. Track registrations through cleanup and Strict Mode without warning for equal IDs in isolated stores. Shared IDs still require consumer correction; production registration and cleanup behavior is unchanged.
