---
"@okyrychenko-dev/react-action-guard": patch
---

Keep conditional blocker configuration current while the condition remains true, including scope, reason, priority, timestamp and timeout options. Preserve unchanged timeout deadlines and use the latest timeout callback. A timeout ends the current registration episode until a polled false-to-true condition transition or a new ID or Provider attachment starts another episode.
