# 内部实现
## 特性
通过语义和项目结构收集包，实现0配置运行。
基于 git 做对比，实现所有命令支持多种方式按需调用

### 语义化？
pkgs 有一个鼻子，首先会判断项目使用的包管理器，基于包管理器的 workspace 读取工作区，没有读取到工作区会默认检测 packages/* 目录，检测失败则会认为该项目是 MultiRepo。当然你也可以通过 `pkgs.config.json` 来定义workspace，项目会优先读取该配置文件的字段

![workspace检测](./assets//images/workspace.png)

### git做了什么？
- 围绕 `git tag` 做版本管理
- 基于 git 的工作区、暂存区和版本库做按需调用

