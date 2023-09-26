# 配置索引
## 配置
支持的配置方式如下:
- 根目录
  - pkgs.config.ts
  - pkgs.config.js
  - pkgs.config.cjs
  - pkgs.config.mjs
  - pkgs.config.json
- package.json的字段
  - pkgs
## 选项
### packagesPath
- __类型：__ string | string[] | undefined
- __默认值：__ 'packages/*'
工作区
### mode
- __类型：__ 'sync' | 'diff'
- __默认值：__ 'sync'
分别对应 lerna 的固定模式(Fixed)或独立模式(Independent)
### push
- __类型：__  boolean
- __默认值：__ true
version 和 publish 后是否需要推送到远程仓库
### version
关于 version 命令配置
#### version.mode
- __类型：__ 'sync' | 'diff'
- __默认值：__ 'sync'
优先级比 mode 高
#### version.message
- __类型：__ string
- __默认值：__ 'chore: version %s'
version 成功后，会进行一次 `git commit` ，你可以自定义它的 message 。%s 是内部基于包与版本生成的文案
#### version.push
- __类型：__ boolean
- __默认值：__ true
优先级比 mode 高
### publish
关于 publish 命令配置
#### publish.mode
- __类型：__ 'sync' | 'diff'
- __默认值：__  'sync'
优先级比 mode 高
#### publish.push
- __类型：__ boolean
- __默认值：__ true
优先级比 mode 高
### run
关于 run 命令配置
#### run.type
- __类型：__ 'all' | 'work' | 'stage' | 'repository'
- __默认值：__ 'all'
`all[全部] | work（工作区） | stage（暂存区） | repository（版本库）`,不同模式对应不同的diff区域对比，并且会分析你的包顺序，智能运行你的命令
#### run.mode
- __类型：__ 'sync' | 'diff'
- __默认值：__ 'sync'
优先级比 mode 高