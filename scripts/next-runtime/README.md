# Packed Next runtime checks

Run `pnpm run build && pnpm run test:next-runtime` with Node 22+, pnpm, npm,
registry access and Chrome installed. Install Chrome with
`pnpm --filter @okyrychenko-dev/react-action-guard-router exec playwright install --with-deps chrome`.
Port 4187 must be free. The runner requires an isolated server and never reuses an
existing application.

The runner uses the existing Changesets cohort preparation in a disposable
workspace, then installs Core and Router tarballs into a fresh npm consumer with
`--strict-peer-deps`. There are no source aliases, package workspace links,
history patches or router patches in the consumer. Next 15.5.23, React/DOM 19.2.8,
TypeScript 5.6.3 and Playwright 1.63.0 are explicitly selected. Chrome is selected
by channel; its actual version is recorded per scenario. “Selected” does not mean
latest or complete peer-range coverage.

One real Next application contains independent Pages and App routes. The Pages
provider and controls persist in `_app`; the App adapter lives inside a client
provider boundary imported by the server layout. `next build` and strict consumer
`tsc --noEmit` must pass before Playwright starts `next start`. The consumer uses
`moduleResolution: bundler` for package export maps; `skipLibCheck` excludes
third-party declaration internals, not fixture code.

| Suite           | Executed behavior                                                                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages.pw.mjs`  | Async cancel/approve; exact onBlock/onAllow/prompt counts; same-URL permission consumed once; latest-attempt-wins; stale answer after owner detach/reattach; Link replay and later protection |
| `app.pw.mjs`    | Active protection allows same-document Link/push, router back/forward and browser back/forward; document identity retained; no native dialog                                                  |
| `unload.pw.mjs` | Separately for Pages and App: user-activated real reload requests a native beforeunload dialog; dismissal retains the document; acceptance reloads; detach/disable removes the prompt         |

The printed `/tmp/action-guard-next-runtime-*` directory retains tarballs, the
versioned cohort, installed consumer, package-lock, browser JSON and failure
traces. `result.json` is written only after build, typecheck and every browser
scenario pass with no skips. It records source base, package-source diff hash, copied fixture hash, exact installed
versions, tarball SHA-256, browser version and individual scenarios. CI retains
the tested Core/Router tarballs, lock, result and browser report; failure traces
are uploaded even when no success result exists. The committed evidence is a
dated local run, not a statement that the new CI job has already passed.

Native-dialog automation verifies Chromium's dialog type and accept/dismiss
effects, not screenshots or browser-specific wording. Custom message text,
tab/window close, cross-origin navigation, browsers without user activation,
other browsers/Next versions, Pages back/forward, synchronous/native confirmation,
silent blocking, shallow/scroll/locale/replace options and arbitrary RSC
compositions are outside this fixture's evidence. App same-document interception
remains outside the adapter contract. Nothing here publishes packages.
