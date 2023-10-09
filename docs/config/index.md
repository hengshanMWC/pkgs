# 配置索引

## 类型
```ts
interface DefaultParams {
  mode: Mode
  push: boolean
}
interface ExecuteCommandConfig extends DefaultParams {
  packagesPath: string | string[] | undefined
  version: CommandVersionParams
  publish: CommandPublishParams
  run: CommandRunParams
  plugins: Array<PluginData | string>
}
```

通过类型提示编写配置
```ts
// pkgs.config.ts
import { defineConfig } from '@abmao/pkgs'

export default defineConfig({})
```
## 配置读取
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

##### run.DAG
- __类型：__ boolean
- __默认值：__ true

DAG 是指：是否开启运 拓扑排序 & 依次执行。

例如：`pkgs run build`，会按依赖顺序，依次执行，保证能正常取到上游依赖构建物


### plugins
插件入口，支持函数、路径、模块名

#### 类型
```ts
interface BasePluginData<T extends any[] = any> {
  id: string // 插件唯一标识
  command: string // 命令
  description: string // 详情
  options?: PluginOption[] // 选择命令
  allowUnknownOption?: boolean // 是否允许传输未定义的 options 命令参数
  action: (context: Context, ...args: T) => void // 执行逻辑
}
type PluginData = Readonly<BasePluginData>
type PluginOption = readonly [flags: string, description?: string, defaultValue?: string | boolean]
```