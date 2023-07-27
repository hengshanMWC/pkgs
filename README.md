# Overview
结合`pnpm`的`monorepo`工具，提供了基本的`version`升级和`publish`发布功能。并且有`sync`和`diff`模式，默认`sync`

同时支持monorepo和multirepo架构

# Usage
```
npm i -g @abmao/pkgs
pkgs version // 升级版本
pkgs publish // 发布包
```

# Features

## mode
monorepo有两种模式
- **sync**: 命令将同步所有包
- **diff**: 命令只会对更改过的文件触发

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
以下是代码中的默认配置，会读取`pnpm-workspace.yaml`找到多包工作区，如果没找该文件到的话，会默认成`packages/*`
```JavaScript
{
  version: {
    mode: undefined,
    message: 'chore: version %s',
  }
}
```
## Options
- **version**: `pkgs version`命令配置
  - **mode**: `sync` | `diff`。决定命令模式
  - **message**: 运行\``git commit -m '${message} v${version}'`\`的message
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

- --tag \<type>: npm publish --tag \<type>

## init
创建pkgs相关文件
```
- packages
- package.json
- pkgs.json
```

## run
可以指定指令例如`pkgs run test`, 会自动触发需要test的包

有3种模式，`all[全部] | work（工作区） | stage（暂存区） | repository（版本库）`，默认`all`，不同模式对应不同的diff区域对比，并且会分析你的包顺序，智能运行你的命令。
```
pkgs run test --type all
pkgs run test --type work
pkgs run test --type stage
pkgs run test --type repository
```