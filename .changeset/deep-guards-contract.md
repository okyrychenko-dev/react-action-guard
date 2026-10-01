---
"@okyrychenko-dev/react-action-guard": major
"@okyrychenko-dev/react-action-guard-devtools": major
"@okyrychenko-dev/react-action-guard-ui": patch
"@okyrychenko-dev/react-action-guard-tanstack": patch
"@okyrychenko-dev/react-action-guard-router": patch
---

Complete the Blocking lifecycle architecture migration. Remove mutable blocker and middleware maps,
named middleware registration, direct event dispatch, and compatibility restore contracts. Observe
lifecycle transitions through ownership-safe anonymous leases and read readonly BlockerInfo snapshots.
Devtools sessions release only their observations; manual observation is now additive on every store.
Centralize guarded-control state and accessible reasons while retaining public hooks, state mappers,
state utilities, and distinct link behavior. Consolidate shared TanStack coverage at its coordination
interface and document migration from removed interfaces. Retain react-zustand-toolkit as the state
management base.
