# React Action Guard documentation

This private VitePress package hosts guides and generated API references for React Action Guard,
Devtools, the TanStack Query integration, and React Zustand Toolkit. The UI and router package
READMEs currently carry their own API guides.

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
- `src/packages/` holds package guides and committed API pages.
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

Update the relevant guide or package README when public usage changes. Check examples against the
current exports, then run the docs build and the root `pnpm run check` command.

[Repository](https://github.com/okyrychenko-dev/react-action-guard) ·
[Issues](https://github.com/okyrychenko-dev/react-action-guard/issues)
