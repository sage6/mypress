import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    base: "/mypress/",
    title: "liweidong's blog",
    description: "记录学习的一下笔记",
    head: [["link", { rel: "icon", href: "/mypress/favicon.svg" }]],
    mermaid: {
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
      },
    },
    vite: {
      optimizeDeps: {
        include: [
          "dayjs",
          "mermaid",
          "@braintree/sanitize-url",
          "debug",
          "cytoscape",
        ],
      },
      build: {
        commonjsOptions: {
          include: [/dayjs/, /node_modules/],
        },
      },
    },
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Go 学习", link: "/docs/go/" },
      ],

      sidebar: {
        "/docs/go/": [
          {
            text: "Go 学习笔记",
            items: [
              { text: "概览", link: "/docs/go/" },
              { text: "1设计哲学与历史", link: "/docs/go/1设计哲学与历史" },
              { text: "2汇编与调用约定", link: "/docs/go/2汇编与调用约定" },
              { text: "3程序的生命周期", link: "/docs/go/3程序的生命周期" },
              { text: "4类型系统", link: "/docs/go/4类型系统" },
              { text: "5数据结构", link: "/docs/go/5数据结构" },
              { text: "6函数延迟和恐慌", link: "/docs/go/6函数延迟和恐慌" },
              { text: "7错误处理", link: "/docs/go/7错误处理" },
            ],
          },
        ],
        "/docs/": [
          {
            text: "文档",
            items: [{ text: "测试页面", link: "/docs/test" }],
          },
        ],
        "/": [
          {
            text: "Examples",
            items: [
              { text: "Markdown Examples", link: "/markdown-examples" },
              { text: "Runtime API Examples", link: "/api-examples" },
            ],
          },
        ],
      },

      socialLinks: [
        { icon: "github", link: "https://github.com/vuejs/vitepress" },
      ],
    },
  }),
);
