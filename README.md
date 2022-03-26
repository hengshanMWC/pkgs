# Overview
结合`pnpm`的`monorepo`工具，提供了基本的`version`升级和`publish`发布功能
# Usage
```
npm i -g @abmao/pkgs
pkgs versoin
pkgs publish
```

# Config
根目录下定义`pkgs.json`，pkgs运行的时候会读取其配置

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
- packagesPath: 多包的目录路径
- mode: `sync` | `diff`。决定`version`和`publish`的模式
- version: `pksg version`命令配置
  - mode: `sync` | `diff`。决定命令模式
  - message: `chore: version`。运行\``git commit -m '${message} v${version}'`\`的message
- publish: `pksg version`命令配置
  - mode: `sync` | `diff`。决定命令模式
  - tag: 运行\``npm publish --tag ${tag}`\`的tag
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
## versoin
*pkgs versoin*

升级package版本号

- --mode \<type>: 默认`sync`
  - sync: 升级所有package版本号
  - diff: 升级修改过的package版本号
- -m --message \<message>: 默认`chore: version`

## publish
*pkgs publish*

发布package

- --mode \<type>: 默认`sync`
  - sync: 发布所有package
  - diff: 发布修改过的package
- --tag \<type>: npm publish --tag \<tag>

## tag
打上pkgs tag。

diff模式是基于git tag进行文件更改分析。场景：当monorepo项目切换成`pkgs`，为了防止错误的`version`和`publish`，请先打上tag

- -p: pkgs tag -p(打上publish标签)
- -v: pkgs tag -v(打上version标签)
# Features
使用`version`和`publish`会打上不同的`git tag`，而`diff mode`则是根据这些`git tag`进行分析
- pkgs version: v`${version}`-v-pkg
- pkgs publish: sync`${Date.now()}`-p-pkg
- pkgs version -m diff: sync`${Date.now()}`-v-pkg
- pkgs publish -m diff: sync`${Date.now()}`-p-pkg

# Function list
- [x] mode：sync
- [x] mode：diff
- [x] Add config
- [x] publish tag perf
- [ ] bumpp perf
- [ ] 语义化
- [ ] Supplementary test
- [ ] Supplementary examples