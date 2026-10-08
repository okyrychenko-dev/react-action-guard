# TanStack browser-history verification

The fixture uses a real TanStack Router with `createBrowserHistory`, React Strict Mode,
and the public navigation-blocker and custom-dialog hooks. No history APIs are mocked.
The two Playwright tests exercise native `window.history.go(-1)` and
`window.history.go(1)`, corresponding to browser back and forward.

## Run

From the repository root, after installing workspace dependencies:

```sh
pnpm --filter @okyrychenko-dev/react-action-guard build
pnpm --filter @okyrychenko-dev/react-action-guard-router test:browser
```

The runner starts and stops a Vite fixture server at `http://127.0.0.1:4173` and
uses installed Google Chrome in headless mode. If Chrome is unavailable, install
it using `pnpm --filter @okyrychenko-dev/react-action-guard-router exec playwright install chrome`.
CI installs Chrome with its system dependencies and runs the tests on Node 22
after the workspace build.

Playwright launches the Vite CLI directly through Node. Using `pnpm run` inside
`webServer.command` can leave Vite in a separate process group with pnpm 12.6.0:
tests finish, but Playwright waits indefinitely for server teardown. The CI browser
step has a three-minute limit covering startup, test execution, and teardown.

Results are written to `packages/router/.cache/browser-history/results.json`.
Each test records the browser version. Failure traces are retained in the adjacent
`artifacts` directory; CI uploads that directory and the result report.

For interactive reproduction, run
`pnpm --filter @okyrychenko-dev/react-action-guard-router browser:serve` and open
the fixture URL. Visit Home, Next, and Other before enabling Protect navigation.
For forward checks, go back to Next before enabling protection. Try browser
back/forward, choose Stay or Leave, and inspect the location and callback counts.

## Verified behavior

In both directions, cancellation retains the original rendered route and browser
URL. Confirmation reaches the intended history destination with one `onAllow`.
A subsequent history attempt opens another dialog and can be cancelled without
leaving that destination. Each attempt produces one `onBlock`.

## Verification history

| Date       | Environment                                                                                                  | Result                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 2026-10-08 | Linux, Chrome 155.0.8059.39                                                                                  | Both back/forward tests passed without retries or skips. |
| 2026-10-03 | Linux, Chrome 154.0.8037.57, Playwright 1.63.0, TanStack Router 1.170.41, React/React DOM 19.2.8, Vite 8.2.1 | Both back/forward tests passed without retries or skips. |

On 2026-10-03, server teardown also completed with `CI=true` and pnpm **12.6.0**:
the full Playwright run exited successfully in 4.7 seconds after launching Vite
directly.

## Coverage limits

This evidence covers matched routes within the same document in the tested Chrome
versions. It does not establish cross-document navigation, other browsers, browser
prompt UI, or the documented TanStack not-found bypass. Unload protection is disabled
in this fixture to keep the check focused on in-app history transitions.
