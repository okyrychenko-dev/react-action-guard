---
"@okyrychenko-dev/react-action-guard": patch
"@okyrychenko-dev/react-action-guard-devtools": patch
"@okyrychenko-dev/react-action-guard-router": patch
"@okyrychenko-dev/react-action-guard-ui": patch
---

Adopt `@okyrychenko-dev/type-utils` 0.1.2 for internal type guards, assertions, and utility types, replacing equivalent hand-rolled checks, a duplicated `assertNever` helper, and inline nullable/optional unions. Runtime behavior is unchanged; some public function signatures now show the package's equivalent utility types. Adds `@okyrychenko-dev/type-utils` as a new dependency and explicitly requires Node.js 20 or newer; Node.js 18 is EOL and unsupported.
