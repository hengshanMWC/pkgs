# Overview
结合`pnpm`的`monorepo`工具，提供了`version`和`publish`命令
# Usage
```shell
npm i -g @abmao/pkgs
pkgs versoin
pkgs publish
```

## Commands
```
pkgs -h
------------
Usage: pkgs [options] [command]

Simple and easy to use monorepos

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  version [options]  mode: sync | diff
  publish [options]  mode: sync | diff
  help [command]     display help for command
```
### versoin
pkgs versoin

升级package版本号
#### options
-m --mode: 默认sync
- sync: 升级所有package版本号
- diff: 升级修改过的package版本号

### publish
pkgs publish

升级package版本号
#### options
-m --mode: 默认sync
- sync: 发布所有package
- diff: 发布修改过的package



# Function list
- [x] mode：sync
- [x] mode：diff
- [ ] Supplementary test
- [ ] Add config

# Features
使用`version`和`publish`会打上不同的gittag
- pkgs version: v`${version}`-v-pkg
- pkgs publish: sync`${Date.now()}`-p-pkg
- pkgs version -m diff: sync`${Date.now()}`-v-pkg
- pkgs publish -m diff: sync`${Date.now()}`-p-pkg