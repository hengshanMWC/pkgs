# Context
## 简介
Context 是 pkgs 的上下文，挂载了多种实例用于处理文件。例如 version、publish 和 run 都使用到了上下文中的 git和包处理等能力

## 类型
```ts
class Context {
  constructor(config: ExecuteCommandConfig, argv?: string[], args?: any[], ttArgv?: string[])
  // 配置
  config: ExecuteCommandConfig
  // 图表依赖
  contextAnalysisDiagram: ContextAnalysisDiagramApi
  // 文件仓库
  fileStore: FileStoreApi
  // 包管理器
  packageManager: ManagerApi
  // 命令管理
  executeManage: ExecuteApi
  // NodeJS.Process['argv']
  argv: ContextParams['argv']
  // 处理后的命令，从中获取插件定义的命令
  args: ContextParams['args']
  // 一般要先启用allowUnknownOption，用来将插件非定义的民乐参数透传
  ttArgv: ContextParams['ttArgv']
  // cli命名，例如用来读取配置文件
  static cli: Agent
  // 创建上下文实例
  static create({ config, git, argv, args, ttArgv }: ContextParams): Promise<Context>
  // 配置合并
  static assignConfig(...config: ExecuteCommandCli[]): Promise<ExecuteCommandConfig>
  // 获取默认配置
  static getDefault(config?: ContextParams['config']): Promise<ExecuteCommandConfig>
  // 获取处理后的args
  get argvValue(): string[]
  // 配置合并
  assignOptions(...config: ExecuteCommandCli[]): this
}
```
## 属性
### config
配置
#### 描述
混合多方配置生成

`项目配置文件 + 包管理器配置 + 默认配置 = config`

优先级：项目配置文件 > 包管理器配置 > 默认配置

#### 类型
[配置索引-类型](/config/#类型)
### contextAnalysisDiagram
依赖图表
#### 描述
寻找包，并且对包依赖进行分析

#### 类型
```ts
interface ContextAnalysisDiagramApi {
  // 工作区
  packagesPath: ExecuteCommandConfig['packagesPath']
  // 图表依赖
  analysisDiagram: AnalysisDiagram
  get allDirs(): string[] // 获取所有包地址
  get allFilesPath(): string[] // 获取所有包package.json地址
  get allPackagesJSON(): IPackageJson<unknown>[] // 获取所有包的package.json
  initData(): Promise<this> // 初始化图表依赖
  // 获取依赖我的包目录
  getRelatedDir(forCD: (cd: (source: AnalysisBlockItem) => void) => Promise<void>): Promise<string[]>
  // 通过文件路径获取包目录
  getRelatedPackagesDir(files: string[] | boolean | undefined): string[]
  // 拓扑排序
  getDirTopologicalSorting(dirs: string[]): string[]
  // package.json交换包信息
  packageJsonToAnalysisBlock(value: IPackageJson): AnalysisBlockItem | null
  // 目录交换包信息
  dirToAnalysisBlock(value: string): AnalysisBlockItem | null
}

// 包名: AnalysisBlockItem
type AnalysisDiagram = Record<string, AnalysisBlockItem>

interface AnalysisBlockItem {
  packageJson: IPackageJson // 包 package.json
  name: string // 包名
  filePath: string // 包 package.json 路径
  dir: string // 包目录路径
  relyMyDir: string[] // 依赖我的包
  myRelyDir: string[] // 我依赖的包
}
```

### fileStore
文件仓库

#### 描述
基于 git 和图表依赖通过多种方式处理文件，模式：diff、sync，git：工作区、暂存区、版本区

#### 类型
```ts
interface FileStoreApi {
  // 图表依赖实例
  contextAnalysisDiagram: ContextAnalysisDiagramApi
  // git实例
  git: SimpleGit
  // 获取所有包路径
  getAllFile(): string[]
  // 获取工作区包路径
  workDiffFile(): Promise<string[]>
  // 获取暂存区包路径
  stageDiffFile(): Promise<string[]>
  // 获取版本区diff模式包路径
  repositoryDiffFile(separator?: string): Promise<string[]>
  // 获取版本区sync模式包路径
  repositorySyncFile(separator?: string): Promise<string[]>
  // sync模式循环版本区
  forRepositorySyncPack(callback: ForPackCallback, separator?: string): Promise<void>
  // diff模式循环版本区
  forRepositoryDiffPack(callback: ForPackCallback, separator?: string): Promise<void>
}
```
### packageManager
包管理器
#### 描述
实现包管理器的一些命令行为
#### 类型
```ts
interface ManagerApi {
  // npm、pnpm之类
  agent: AgentType
  // 获取包工作区配置
  getConfig(): Promise<ExecuteCommandCli>
  // 例如：npm run [cmd]
  run(cmd: string, args?: string[], options?: Options): CommandResult
  // 例如：npm publish
  publish(
    packageJson: IPackageJson<any>,
    args?: string[], // 命令参数
    options?: Options, // 触发命令方法的参数
  ): CommandResult
}
```
### executeManage
命令管理
#### 描述
用来执行各种命令
#### 类型
```ts
interface ExecuteApi {
  // 录入命令数据
  enterMainResult(commandMainResult: HandleMainResult): this
  // 返回命令数据
  getCommandData(): {
    analysisBlockList: AnalysisBlockItem[]
    commandData: CommandResult<any>[]
  }
  // 执行
  execute(): Promise<any[]>
}
```