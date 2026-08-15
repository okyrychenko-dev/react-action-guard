import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

// Registered lazily (defineAsyncComponent) instead of via vitepress-plugin-mermaid's
// withMermaid(), which patches vitepress's own client entry to register Mermaid eagerly,
// forcing mermaid.js (~600kB) into the shared app chunk on every page. Only the 3 pages
// that render a ```mermaid fence load this chunk.
export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)
    ctx.app.component(
      'Mermaid',
      defineAsyncComponent(() => import('vitepress-plugin-mermaid/Mermaid.vue'))
    )
  }
} satisfies Theme
