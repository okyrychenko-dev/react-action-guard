---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-ui": patch
---

Centralize scope normalization, inheritance, observation, and targeted-clear semantics in the core package, preserve empty observed scopes, and migrate guarded UI controls to use the shared behavior. The UI package now requires the core release that exports these helpers.
