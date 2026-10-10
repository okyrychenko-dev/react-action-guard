# Navigation protection

Choose the adapter matching your router. Register shared scopes such as `navigation` during
saves, or use `when` for dirty-state protection. A UI guarded link prevents that element's
activation; it does not cover router calls, browser history or other links.

| Integration                                                              | Same-document navigation                    | Unload                      |
| ------------------------------------------------------------------------ | ------------------------------------------- | --------------------------- |
| [React Router](../packages/react-action-guard-router/react-router)       | Native data-router blocking / confirmation  | Browser `beforeunload`      |
| [TanStack Router](../packages/react-action-guard-router/tanstack-router) | Native blocker composition / confirmation   | Browser `beforeunload`      |
| [Next Pages](../packages/react-action-guard-router/next-pages)           | Limited route-event cancellation and replay | Browser `beforeunload`      |
| [Next App](../packages/react-action-guard-router/next-app)               | No interception guarantee                   | Browser `beforeunload` only |

Each integration page documents its public entry, prerequisites and limitations. Async
confirmation belongs to the current attached attempt: replaced or detached attempts cannot
grant stale permission. Applications supply dialogs and handle asynchronous application errors.
Unload dialogs are browser-controlled: activation requirements and browser policy can prevent
them; custom text is generally ignored. They cannot run an asynchronous confirmation dialog.

Use [versioned capability evidence](https://github.com/okyrychenko-dev/react-action-guard/blob/main/CAPABILITIES.md)
for evaluated peer versions and commands. Hook/declaration checks do not establish real Next
runtime guarantees; packed Next build/start/browser verification remains a separate task.
