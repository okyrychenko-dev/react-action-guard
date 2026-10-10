import { defineConfig } from "vitepress";
import { MermaidMarkdown } from "vitepress-plugin-mermaid";
import type { Plugin } from "vite";

// vitepress-plugin-mermaid's own render config (securityLevel: 'loose' is required so
// mermaid can load images inside diagrams). Consumed by Mermaid.vue at runtime via the
// virtual module below.
const mermaidRenderConfig = {
  securityLevel: "loose",
  startOnLoad: false,
};

const virtualMermaidConfigId = "virtual:mermaid-config";
const resolvedVirtualMermaidConfigId = "\0" + virtualMermaidConfigId;

// Reimplements only the resolveId/load half of vitepress-plugin-mermaid's Vite plugin.
// The half we deliberately drop is its `transform` hook, which patches vitepress's own
// client entry to register the Mermaid component eagerly on every page — see
// .vitepress/theme/index.ts for the lazy replacement.
function mermaidConfigPlugin(): Plugin {
  return {
    name: "mermaid-config-virtual-module",
    resolveId(id) {
      if (id === virtualMermaidConfigId) {
        return resolvedVirtualMermaidConfigId;
      }
    },
    load(id) {
      if (id === resolvedVirtualMermaidConfigId) {
        return `export default ${JSON.stringify(mermaidRenderConfig)};`;
      }
    },
  };
}

export default defineConfig({
  srcDir: "src",
  title: "React Action Guard",
  description: "Elegant UI blocking management for React applications",

  // Links to content that is planned but not written yet. Remove an entry once the
  // corresponding page is added.
  ignoreDeadLinks: [
    "./types",
    "/roadmap",
    "./../internals/store-implementation",
    "./internals/store-implementation",
    "./../internals/middleware-architecture",
    "./../internals/performance",
    "./guides/getting-started",
  ],

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Packages", link: "/packages/react-action-guard/" },
    ],

    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Getting started", link: "/getting-started" },
          { text: "Concepts", link: "/concepts" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Forms and saves", link: "/guides/forms" },
          { text: "Queries and mutations", link: "/guides/mutations" },
          { text: "Navigation", link: "/guides/navigation" },
          { text: "Workflows", link: "/guides/workflows" },
          { text: "Registration lifecycle", link: "/guides/lifecycle" },
          { text: "Best practices", link: "/guides/best-practices" },
        ],
      },
      {
        text: "Integrations",
        items: [
          { text: "UI controls", link: "/packages/react-action-guard-ui/" },
          { text: "UI reference", link: "/packages/react-action-guard-ui/reference" },
          { text: "Router overview", link: "/packages/react-action-guard-router/" },
          {
            text: "React Router / Remix",
            link: "/packages/react-action-guard-router/react-router",
          },
          { text: "TanStack Router", link: "/packages/react-action-guard-router/tanstack-router" },
          { text: "Next Pages Router", link: "/packages/react-action-guard-router/next-pages" },
          { text: "Next App Router", link: "/packages/react-action-guard-router/next-app" },
          { text: "Router reference", link: "/packages/react-action-guard-router/reference" },
          { text: "TanStack Query", link: "/packages/react-action-guard-tanstack/" },
          { text: "Devtools", link: "/packages/react-action-guard-devtools/" },
        ],
      },
      {
        text: "Advanced",
        items: [
          { text: "Providers and typed hooks", link: "/advanced/ownership" },
          { text: "SSR and hydration", link: "/advanced/ssr" },
          { text: "Observability", link: "/advanced/observability" },
          { text: "Architecture", link: "/architecture/" },
        ],
      },
      {
        text: "Core and reference",
        items: [
          { text: "Core overview", link: "/packages/react-action-guard/" },
          { text: "Core reference and recipes", link: "/packages/react-action-guard/reference" },
          { text: "Stable Core contract", link: "/packages/react-action-guard/contract" },
          { text: "Migration", link: "/packages/react-action-guard/migration" },
          { text: "Hooks", link: "/packages/react-action-guard/api/hooks" },
          { text: "Store", link: "/packages/react-action-guard/api/store" },
          { text: "Middleware", link: "/packages/react-action-guard/api/middleware" },
          { text: "Core generated API", link: "/packages/react-action-guard/api/typedoc/README" },
          {
            text: "Query generated API",
            link: "/packages/react-action-guard-tanstack/api/typedoc/README",
          },
          {
            text: "Devtools generated API",
            link: "/packages/react-action-guard-devtools/api/typedoc/README",
          },
          { text: "Zustand Toolkit", link: "/packages/react-zustand-toolkit/" },
          {
            text: "Toolkit generated API",
            link: "/packages/react-zustand-toolkit/api/typedoc/README",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/okyrychenko-dev/react-action-guard" },
    ],
  },

  markdown: {
    config(md) {
      MermaidMarkdown(md);
    },
  },

  vite: {
    plugins: [mermaidConfigPlugin()],
    optimizeDeps: {
      include: ["@braintree/sanitize-url", "dayjs", "debug", "cytoscape-cose-bilkent", "cytoscape"],
    },
    resolve: {
      alias: {
        "dayjs/plugin/advancedFormat.js": "dayjs/esm/plugin/advancedFormat",
        "dayjs/plugin/customParseFormat.js": "dayjs/esm/plugin/customParseFormat",
        "dayjs/plugin/isoWeek.js": "dayjs/esm/plugin/isoWeek",
        "cytoscape/dist/cytoscape.umd.js": "cytoscape/dist/cytoscape.esm.js",
      },
    },
    build: {
      // mermaid.js is now isolated into its own async chunk (see .vitepress/theme),
      // loaded only on the pages that render a diagram. Its ~630kB is unavoidable and
      // no longer ships to every page, so raising the per-chunk warning here is safe.
      chunkSizeWarningLimit: 700,
    },
  },
});
