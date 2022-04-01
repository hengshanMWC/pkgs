# Overview
结合`pnpm`的`monorepo`工具，提供了基本的`version`升级和`publish`发布功能。并且有`sync`和`diff`模式，默认`sync`

# Usage
```
npm i -g @abmao/pkgs
pkgs version // 升级版本
pkgs publish // 发布包
```
monorepo项目切换成pkgs，应该先运行`pkgs tag`，防止错误的`version`和`publish`

# Features

## mode
monorepo有两种模式
- **sync**: 命令将同步所有包
- **diff**: 命令只会对更改过的文件触发

## Semantic

对`packages.json`进行版本分析，对于`workspace`的`*`、`^`、`~`都有对应的语意化处理
## CreateTag
使用`version`和`publish`命令会打上不同的`git tag`，而`diff mode`则是根据这些`git tag`进行分析。（👇🏻运行命令后，cli打上的tag
- pkgs version: v`${version}`-v-pkg
- pkgs publish: sync`${Date.now()}`-p-pkg
- pkgs version -m diff: sync`${Date.now()}`-v-pkg
- pkgs publish -m diff: sync`${Date.now()}`-p-pkg


# Config
根目录下定义`pkgs.json`，pkgs运行时会读取其配置

## Default
以下是代码中的默认配置
```JavaScript
{
  packagesPath: 'packages/*',
  mode: 'sync',
  version: {
    mode: undefined,
    message: 'chore: version',
  },
  publish: {
    mode: undefined,
    tag: '',
  },
}
```
## Options
- **packagesPath**: 多包的目录路径
- **mode**: `sync` | `diff`。决定`version`和`publish`的模式
- **version**: `pkgs version`命令配置
  - **mode**: `sync` | `diff`。决定命令模式
  - **message**: 运行\``git commit -m '${message} v${version}'`\`的message
- **publish**: `pkgs version`命令配置
  - **mode**: `sync` | `diff`。决定命令模式
  - **tag**: 运行\``npm publish --tag ${tag}`\`的tag。如果不传，会分析你的version是否需要添加--tag。例如: version: '1.0.0-beta.1', 发布命令会变成`npm publish --tag beta`
# Commands
```
pkgs -h
------------
Usage: pkgs [options] [command]

Simple monorepo combined with pnpm

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  version [options]  version package
  publish [options]  publish package
  tag [options]      pkgs tag, diff mode: Compare according to tag
  help [command]     display help for command
```
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

- --mode \<type>:
  - sync: 发布所有package
  - diff: 发布更改过的package
- --tag \<type>: npm publish --tag \<type>

## tag
打上pkgs tag。

diff模式是基于git tag进行文件更改分析。场景：当monorepo项目切换成`pkgs`，为了防止错误的`version`和`publish`，请先打上tag

不带参数则相当于打上两种一下tag
- -p: pkgs tag -p(打上publish标签)
- -v: pkgs tag -v(打上version标签)

# Function list
- [x] mode：sync
- [x] mode：diff
- [x] Add config
- [x] publish tag perf
- [x] 语义化
- [x] bumpp perf
- [x] bumpp perf，After that, adjust the structure.
- [x] Supplementary test
- [x] Supplementary examples
- [ ] pkgs init