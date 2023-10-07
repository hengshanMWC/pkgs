import path from 'node:path'
import { defineConfig } from 'vitepress'
import { repository } from '../../package.json'

const loginPath = '../assets/images/logo.svg'
const githubPath = repository.url.replace(/git\+/, '')

export default defineConfig({
  outDir: path.join(__dirname, '../dist'),
  title: '@abmao/pkgs',
  description: '一个简单的、既可以用于 Mono-repo 又可以用于 Multi-repo 的项目管理器。',
  base: '/pkgs/docs/dist/',
  head: [
    ['link', { rel: 'icon', href: loginPath }],
  ],
  themeConfig: {
    siteTitle: '@abmao/pkgs',
    logo: loginPath,
    socialLinks: [
      { icon: 'github', link: githubPath },
    ],
    sidebar: [
      {
        text: '指南',
        collapsible: true,
        items: [
          {
            text: '简介', // 做什么、为什么要用、思想
            link: '/',
          },
          {
            text: '快速起步', // 依赖安装、模板下载、运行命令
            link: '/use',
          },
          {
            text: '内部运行',
            link: '/principle',
          },
          {
            text: '插件',
            link: '/plugin',
          },
        ],
      },
      {
        text: 'API',
        collapsible: true,
        items: [
          {
            text: 'Context',
            link: 'api/context',
          },
          {
            text: 'Plugin',
            link: 'api/plugin',
          },
          {
            text: 'Cli',
            link: 'api/cli',
          },
        ],
      },
      {
        text: '配置',
        collapsible: true,
        items: [
          {
            text: '配置索引',
            link: 'config/index',
          },
        ],
      },
    ],
  },
})
