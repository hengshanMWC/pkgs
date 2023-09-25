import { defineConfig } from 'vitepress'
import { repository } from '../../package.json'

const loginPath = '../assets/images/logo.svg'
const githubPath = repository.url.replace(/git\+/, '')

export default defineConfig({
  title: '@abmao/pkgs',
  description: '一个简单的、既可以用于 Mono-repo 又可以用于 Multi-repo 的项目管理器。',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: loginPath }]
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
            text: '主要功能',
            link: '/features',
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
            text: 'Command',
            link: 'api/command',
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
  }
})
