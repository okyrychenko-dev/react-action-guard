# React Action Guard documentation

This private VitePress package hosts guides and generated API references for React Action Guard,
UI controls, Router adapters, Devtools, the TanStack Query integration, and React Zustand Toolkit.
The site is the canonical learning/reference path; package READMEs retain onboarding and legacy links.

## Work locally

Run these commands from the monorepo root:

```bash
pnpm install
pnpm --filter @okyrychenko-dev/react-action-guard-docs run dev
pnpm --filter @okyrychenko-dev/react-action-guard-docs run build
pnpm --filter @okyrychenko-dev/react-action-guard-docs run preview
```

The development server prints its local URL. VitePress uses `http://localhost:5173/` by default
when that port is available.

## Content layout

- `src/getting-started.md` and `src/index.md` introduce the ecosystem.
- `src/concepts.md`, `src/guides/` and `src/advanced/` form the progressive learning path.
- `src/packages/` holds integration guides, the Core contract/migration and committed API pages.
- `src/typedoc.*.json` configures API generation for each documented package.
- `.vitepress/` contains the site configuration and theme.

Source comments stay concise; usage examples and longer explanations belong in the package
READMEs and these guides.

## API reference generation

From the monorepo root, run `pnpm --filter @okyrychenko-dev/react-action-guard-docs run typedoc`
to regenerate all configured references. The package also exposes `typedoc:core`,
`typedoc:devtools`, `typedoc:tanstack`, and `typedoc:zustand` for targeted updates.
Review generated changes before committing them.

## Contributing

Update the relevant guide or package README when public usage changes. Build public package declarations, then run `pnpm run docs:check` for canonical example compilation
and local navigation/link verification. Run the docs build and root `pnpm run check` as well.

[Repository](https://github.com/okyrychenko-dev/react-action-guard) ·
[Issues](https://github.com/okyrychenko-dev/react-action-guard/issues)
