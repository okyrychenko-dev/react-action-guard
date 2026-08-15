# React Action Guard Documentation

> Comprehensive documentation for the React Action Guard ecosystem

This repository contains the complete documentation for all React Action Guard packages:

- **[@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard)** - Core UI blocking management
- **[@okyrychenko-dev/react-action-guard-devtools](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-devtools)** - Developer tools
- **[@okyrychenko-dev/react-action-guard-tanstack](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-tanstack)** - TanStack Query integration
- **[@okyrychenko-dev/react-zustand-toolkit](https://www.npmjs.com/package/@okyrychenko-dev/react-zustand-toolkit)** - Zustand utilities

## 🚀 Quick Start

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The documentation will be available at `http://localhost:5173/`

## 📖 Documentation Structure

```
.
├── src/                 # Documentation source
│   ├── .vitepress/      # VitePress configuration
│   ├── packages/        # Package-specific documentation
│   │   ├── react-action-guard/
│   │   ├── react-action-guard-devtools/
│   │   ├── react-action-guard-tanstack/
│   │   └── react-zustand-toolkit/
│   ├── guides/          # Cross-package guides
│   ├── architecture/    # Architecture documentation
│   ├── index.md        # Landing page
│   ├── getting-started.md
│   └── typedoc.json
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions to improve the documentation!

### Making Changes

1. Fork this repository
2. Create a branch: `git checkout -b docs/your-improvement`
3. Make your changes
4. Test locally: `npm run dev`
5. Build to verify: `npm run build`
6. Submit a pull request

### Documentation Guidelines

- **Clear and concise**: Write for developers of all skill levels
- **Code examples**: Include working code examples
- **Up to date**: Ensure examples match latest API
- **Links**: Use relative links for internal navigation
- **Formatting**: Follow existing Markdown conventions

## 🔗 Links

- **Main Repository**: [react-action-guard](https://github.com/okyrychenko-dev/react-action-guard)
- **NPM Packages**: [@okyrychenko-dev](https://www.npmjs.com/~okyrychenko-dev)
- **Issues**: [GitHub Issues](https://github.com/okyrychenko-dev/react-action-guard/issues)

## 📝 License

MIT © Oleksii Kyrychenko

---

**Built with [VitePress](https://vitepress.dev/)**
