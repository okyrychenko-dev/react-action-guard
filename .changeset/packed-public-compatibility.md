---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-ui": patch
"@okyrychenko-dev/react-action-guard-devtools": patch
"@okyrychenko-dev/react-action-guard-tanstack": patch
"@okyrychenko-dev/react-action-guard-router": minor
---

Publish format-specific ESM and CommonJS declarations so NodeNext CommonJS consumers can use the supported public imports. Correct Core's legacy main/module paths and resolve Next's router.js entry so native Node ESM can load the Next adapter. Require React Router DOM >=6.19.0 within v6 or v7 because earlier v6 releases do not export the stable useBlocker API. This excludes previously declared unsupported versions and releases the pre-1.0 router package as a minor change. Consumers on older v6 must upgrade before adopting this release; no new runtime dependency is added. Publish evidence-labelled capabilities and packed peer/provider checks, and clarify App Router and application-owned payment cancellation limits.
