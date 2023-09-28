# Plugin
## 简介
pkgs 功能命令是通过内部插件实现，插件导出了多种接口供开发者调用

## API

### version

#### parseCommandVersion

##### 描述
包版本升级，生成命令参数传入到 context，可以通过`context.executeManage.execute()`执行实际命令
##### 类型
```ts
function parseCommandVersion(
  configParam?: CommandVersionParams,
  git?: SimpleGit,
  appointVersion?: string,
  argv?: string[]
): Promise<Context>
```
##### 调用
```ts
import { parseCommandVersion } from '@abmao/pkgs'
parseCommandVersion()
```

#### commandVersion

##### 描述
包版本升级
##### 类型
```ts
function commandVersion(
  configParam?: CommandVersionParams,
  git?: SimpleGit,
  appointVersion?: string,
  argv?: string[]
): Promise<{
  analysisBlockList: AnalysisBlockItem[]
  executeResult: any[]
}>
```

##### 调用
```ts
import { commandVersion } from '@abmao/pkgs'
commandVersion()
```

### publish
#### parseCommandPublish

##### 描述
包版本发布，生成命令参数传入到 context，可以通过`context.executeManage.execute()`执行实际命令
##### 类型
```ts
function parseCommandPublish(
  configParam?: CommandPublishParams,
  git?: SimpleGit,
  argv?: string[]
): Promise<Context>
```
##### 调用
```ts
import { parseCommandPublish } from '@abmao/pkgs'
parseCommandPublish()
```

#### commandPublish

##### 描述
包版本发布
##### 类型
```ts
function commandPublish(
  configParam?: CommandPublishParams,
  git?: SimpleGit,
  argv?: string[]
): Promise<{
  analysisBlockList: AnalysisBlockItem[]
  executeResult: any[]
}>
```

##### 调用
```ts
import { commandPublish } from '@abmao/pkgs'
commandPublish()
```
### run
#### parseCommandRun

##### 描述
包命令运行，生成命令参数传入到 context，可以通过`context.executeManage.execute()`执行实际命令
##### 类型
```ts
function parseCommandRun(
  cmd: string,
  configParam?: CommandRunParams,
  git?: SimpleGit,
  argv?: string[]
): Promise<Context>
```
##### 调用
```ts
import { parseCommandRun } from '@abmao/pkgs'
// 传入命令 test，遍历包生成对应的 npm run test 命令
parseCommandRun('test')
```

#### commandRun

##### 描述
包命令运行
##### 类型
```ts
function commandRun(
  cmd: string,
  configParam?: CommandRunParams,
  git?: SimpleGit,
  argv?: string[]
): Promise<{
  analysisBlockList: AnalysisBlockItem[]
  executeResult: any[]
}>
```

##### 调用
```ts
import { commandRun } from '@abmao/pkgs'
// 传入命令 test，遍历包执行 npm run test 命令
commandRun('test')
```
### init
#### parseCommandInit

##### 描述
创建 pkgs 项目模版，生成命令参数传入到 context，可以通过`context.executeManage.execute()`执行实际命令
##### 类型
```ts
function parseCommandInit(): (CopyFileExecuteTask | MkdirExecuteTask)[]

class CopyFileExecuteTask implements ExecuteTask<CopyFileExecuteCommandResult> {
  commandData: CopyFileExecuteCommandResult
  constructor(commandData: CopyFileExecuteCommandData)
  getCommandData(): CopyFileExecuteCommandResult
  execute(): Promise<void>
}
class MkdirExecuteTask implements ExecuteTask {
  commandData: CommandResult
  constructor(commandData: ExecuteCommandData)
  getCommandData(): CommandResult<string[]>
  execute(): Promise<import('fs').Stats | undefined>
}
```
##### 调用
```ts
import { parseCommandInit } from '@abmao/pkgs'
parseCommandInit()
```

#### commandInit

##### 描述
创建 pkgs 项目模版
##### 类型
```ts
function commandInit(): Promise<{
  executeResult: any[]
}>
```

##### 调用
```ts
import { commandInit } from '@abmao/pkgs'
commandInit()
```