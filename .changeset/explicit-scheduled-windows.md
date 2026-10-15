---
"@okyrychenko-dev/react-action-guard": patch
---

Validate every supplied scheduled-window bound, preserve epoch-zero ends, and treat zero duration as an empty window instead of indefinite blocking. Invalid bounds cancel hook-owned work with a development warning. Support distant finite starts using bounded timer chunks, matching end deadlines. Omit duration and end explicitly when indefinite blocking is intended.

Empty future windows do not retain start timers or repeatedly wake for distant deadlines.
