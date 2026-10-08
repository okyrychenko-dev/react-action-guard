---
"@okyrychenko-dev/react-action-guard-tanstack": patch
---

Protect all unsettled calls initiated through one useBlockingMutation hook, including concurrent calls, native awaited callbacks, retries, pauses, and queues. Preserve native result observation and callback behavior. Reset and mutation-key changes retain pending ownership; unmount retains pending protection until settlement or timeout. Timeouts end an aggregate registration episode without cancelling work or allowing rerenders and additional calls to revive expired protection.

Strengthen Query and Mutation registration tests to require blocker existence before checking metadata.
