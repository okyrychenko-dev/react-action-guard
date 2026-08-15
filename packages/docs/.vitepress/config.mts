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
    "./testing",
    "./../examples/ssr",
  ],

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Packages", link: "/packages/react-action-guard/" },
    ],

    sidebar: {
      "/packages/react-action-guard/": [
        {
          text: "react-action-guard",
          items: [
            { text: "Overview", link: "/packages/react-action-guard/" },
            { text: "API Reference", link: "/packages/react-action-guard/api/typedoc/README" },
          ],
        },
      ],
      "/packages/react-action-guard-devtools/": [
        {
          text: "react-action-guard-devtools",
          items: [
            { text: "Overview", link: "/packages/react-action-guard-devtools/" },
            {
              text: "API Reference",
              link: "/packages/react-action-guard-devtools/api/typedoc/README",
            },
          ],
        },
      ],
      "/packages/react-action-guard-tanstack/": [
        {
          text: "react-action-guard-tanstack",
          items: [
            { text: "Overview", link: "/packages/react-action-guard-tanstack/" },
            {
              text: "API Reference",
              link: "/packages/react-action-guard-tanstack/api/typedoc/README",
            },
          ],
        },
      ],
      "/packages/react-zustand-toolkit/": [
        {
          text: "react-zustand-toolkit",
          items: [
            { text: "Overview", link: "/packages/react-zustand-toolkit/" },
            { text: "API Reference", link: "/packages/react-zustand-toolkit/api/typedoc/README" },
          ],
        },
      ],
      "/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/getting-started" },
            { text: "Architecture", link: "/architecture/" },
          ],
        },
        {
          text: "Packages",
          items: [
            { text: "react-action-guard", link: "/packages/react-action-guard/" },
            { text: "react-action-guard-devtools", link: "/packages/react-action-guard-devtools/" },
            { text: "react-action-guard-tanstack", link: "/packages/react-action-guard-tanstack/" },
            { text: "react-zustand-toolkit", link: "/packages/react-zustand-toolkit/" },
          ],
        },
      ],
    },

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
