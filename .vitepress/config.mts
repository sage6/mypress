import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "liweidong's blog",
  description: "记录学习的一下笔记",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '文档', link: '/docs/test' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/docs/': [
        {
          text: '文档',
          items: [
            { text: '测试页面', link: '/docs/test' },
            { text: '主 Goroutine 的生与死', link: '/docs/go/3.6主Goroutine的生与死' }
          ]
        }
      ],
      '/': [
        {
          text: 'Examples',
          items: [
            { text: 'Markdown Examples', link: '/markdown-examples' },
            { text: 'Runtime API Examples', link: '/api-examples' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
