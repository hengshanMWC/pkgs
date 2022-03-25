# Overview
simple monorepo，Only `version` and `publish` commands are provided
# Usage
```shell
npm i -g @abmao/pkgs
pkgs versoin
pkgs publish
```

## Commands
- versoin: Upgrade the `version` of all `package.json`
- publish: `Publish` all non private `package.json`

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