---
"@okyrychenko-dev/react-action-guard": patch
---

Guarantee scheduled blocker completion when start or end notifications throw. Schedule the end before notifying start, and always release protection after the end notification. Cancel scheduled notifications and release protection when an immediate start notification prevents effect setup. Notification errors remain observable.
