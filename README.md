# Overview
`pkgs` 是一个 `monorepo cli`，它只做该做的事

- 无论 `monorepo` 还是 `multirepo` 架构都可以使用
- 0配置开箱即用
- 天生支持按需调用
- 支持插件化

# Usage
```
npm i -g @abmao/pkgs
pkgs init // 初始化模板
pkgs version // 升级版本
pkgs publish // 发布包
pkgs run build // 按需运行命令
```

# Features

## mode
monorepo有两种模式
- **sync**: 命令将同步所有包
- **diff**: 命令只会对受影响的包触发

# Config
支持的配置方式如下:
- 根目录
  - pkgs.config.ts
  - pkgs.config.js
  - pkgs.config.cjs
  - pkgs.config.mjs
  - pkgs.config.json
- package.json的字段
  - pkgs
## Default
以下是代码中的默认配置
```JavaScript
{
  packagesPath: undefined,
  mode: 'sync',
  push: true,
  version: {
    message: 'chore: version %s',
  },
  publish: {},
  run: {
    type: 'all',
  },
  plugins: [],
}
```
`pkgs` 基于 [ni](https://github.com/antfu/ni) 获取项目使用的包管理器，基于该包管理器寻找 `workspace` 相关信息。默认为 `pnpm` ,运行路程如下，读取`pnpm-workspace.yaml`找到工作区，如果没找到该部份信息，会默认成`packages/*`，如果不存在该路径，该项目会视为是 `multirepo` 架构
## Options
- **packagesPath**: 工作区, string | string[] | undefined。例如 ‘packages/*’
- **mode**: `sync` | `diff`。决定命令模式
- **push**: 自动提交到所有远程仓库
- **version**: `pkgs version`命令配置
  - **mode**: `sync` | `diff`。决定命令模式
  - **message**: 运行\``git commit -m '${message} v${version}'`\`的message
  - **push**: 自动提交到所有远程仓库
- **publish**: `pkgs publish`命令配置
  - **mode**: `sync` | `diff`。决定命令模式
  - **push**: 自动提交到所有远程仓库
- **run**: `pkgs run <cmd>`按需运行命令
  - **type**: `all[全部] | work（工作区） | stage（暂存区） | repository（版本库）`
  - **mode**: `sync` | `diff`。决定命令模式
# Commands
可以使用`pkgs -h`查看具体指令
## version
*pkgs version*

升级package版本号

- --mode \<type>: 默认`sync`
  - sync: 升级所有package版本号
  - diff: 升级修更改过和需要更改的package版本号
- -m --message \<message>: 默认`chore: version`。运行\``git commit -m '${message} v${version}'`\`的message

## publish
*pkgs publish*

发布package

- --mode \<type>: 默认`sync`
  - sync: 升级所有package版本号
  - diff: 升级修更改过和需要更改的package版本号

## init
*pkgs init*

创建pkgs相关文件
```
- packages
- package.json
- pkgs.json
```

## run
*pkgs run \<cmd>*

可以指定指令例如`pkgs run test`, 会自动触发需要test的包

有3种模式，`all[全部] | work（工作区） | stage（暂存区） | repository（版本库）`，默认`all`，不同模式对应不同的diff区域对比，并且会分析你的包顺序，智能运行你的命令。
```
pkgs run test --type all
pkgs run test --type work
pkgs run test --type stage
pkgs run test --type repository
```

- --mode \<type>: 默认`sync`
  - sync: 升级所有package版本号
  - diff: 升级修更改过和需要更改的package版本号