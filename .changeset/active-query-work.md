---
"@okyrychenko-dev/react-action-guard-tanstack": minor
---

Block query initial loading only while pending and actively fetching. Disabled idle and offline paused queries no longer block by default across single, infinite, and collection hooks. Background refetch and pagination blocking remain opt-in, and mutation pending behavior is unchanged. See the TanStack README migration guidance for workflows that previously relied on pending queries without active work.
