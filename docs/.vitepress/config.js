import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'lerna-template',
  description: 'lerna模板',
  base: '/',
  themeConfig: {
    siteTitle: 'lerna-template',
    sidebar: [
      {
        text: '介绍',
        collapsible: true,
        items: [
          {
            text: 'demo',
            link: '/',
          },
        ],
      },
    ],
  },
})
