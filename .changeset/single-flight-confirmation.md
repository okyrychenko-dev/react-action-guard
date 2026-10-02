---
"@okyrychenko-dev/react-action-guard": patch
---

Prevent repeated confirmation calls from executing the same action more than once per hook
instance. Concurrent callers share its outcome; reopening and cancellation are ignored while
execution is pending. Success and failure both allow retry. Existing timeout and unmount
behavior remains unchanged.
