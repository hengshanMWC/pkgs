# Overview
一个简单的、既可以用于 Mono-repo 又可以用于 Multi-repo 的项目管理器。

与实现了包版本 workspace 的包管理器（pnpm、yarn、npm）配合

- 📦 repo 抹平：以包为单位进行管理
- 🎁 开箱即用：0配置语义化运行
- 🐚 只做本分：配合包管理器各司其职
- 🎛️ 按需调用：基于 git 的按需调用
- 🔌 插件化：支持自定义插件

详情请看[docs](https://hengshanmwc.github.io/pkgs/docs/dist)

# Usage
```
npm i -g @abmao/pkgs
pkgs init // 初始化模板
pkgs version // 升级版本
pkgs publish // 发布包
pkgs run build // 按需运行命令
```