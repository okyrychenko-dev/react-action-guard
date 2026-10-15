---
"@okyrychenko-dev/react-action-guard": patch
---

Honor long finite blocker timeouts with bounded timer chunks. Reject nonfinite timeouts and unrepresentable deadlines with RangeError before changing registrations or existing timers. Omitted, zero and finite negative timeouts continue to disable expiration; replace infinity/NaN sentinels with an omitted timeout or zero.
