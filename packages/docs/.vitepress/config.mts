import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    srcDir: 'src',
    title: 'React Action Guard',
    description: 'Elegant UI blocking management for React applications',
    
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Getting Started', link: '/getting-started' },
        { text: 'Packages', link: '/packages/react-action-guard/' }
      ],

      sidebar: {
        '/packages/react-action-guard/': [
          {
            text: 'react-action-guard',
            items: [
              { text: 'Overview', link: '/packages/react-action-guard/' },
              { text: 'API Reference', link: '/packages/react-action-guard/api/typedoc/README' }
            ]
          }
        ],
        '/packages/react-action-guard-devtools/': [
          {
            text: 'react-action-guard-devtools',
            items: [
              { text: 'Overview', link: '/packages/react-action-guard-devtools/' },
              { text: 'API Reference', link: '/packages/react-action-guard-devtools/api/typedoc/README' }
            ]
          }
        ],
        '/packages/react-action-guard-tanstack/': [
          {
            text: 'react-action-guard-tanstack',
            items: [
              { text: 'Overview', link: '/packages/react-action-guard-tanstack/' },
              { text: 'API Reference', link: '/packages/react-action-guard-tanstack/api/typedoc/README' }
            ]
          }
        ],
        '/packages/react-zustand-toolkit/': [
          {
            text: 'react-zustand-toolkit',
            items: [
              { text: 'Overview', link: '/packages/react-zustand-toolkit/' },
              { text: 'API Reference', link: '/packages/react-zustand-toolkit/api/typedoc/README' }
            ]
          }
        ],
        '/': [
          {
            text: 'Introduction',
            items: [
              { text: 'Getting Started', link: '/getting-started' },
              { text: 'Architecture', link: '/architecture/' }
            ]
          },
          {
            text: 'Packages',
            items: [
              { text: 'react-action-guard', link: '/packages/react-action-guard/' },
              { text: 'react-action-guard-devtools', link: '/packages/react-action-guard-devtools/' },
              { text: 'react-action-guard-tanstack', link: '/packages/react-action-guard-tanstack/' },
              { text: 'react-zustand-toolkit', link: '/packages/react-zustand-toolkit/' }
            ]
          }
        ]
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/okyrychenko-dev/react-action-guard' }
      ]
    },

    // Mermaid configuration
    mermaid: {
      // Optional: customize Mermaid theme
      // theme: 'default'
    }
  })
)
