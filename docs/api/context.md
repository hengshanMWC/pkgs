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
  // 命令执行
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
  packagesPath: ExecuteCommandConfig['packagesPath']
  analysisDiagram: AnalysisDiagram
  get allDirs(): string[]
  get allFilesPath(): (string | undefined)[]
  get allPackagesJSON(): (IPackageJson<unknown> | undefined)[]
  initData(): Promise<this>
  getRelatedDir(forCD: (cd: (source: AnalysisBlockItem) => void) => Promise<void>): Promise<string[]>
  getRelatedPackagesDir(files: string[] | boolean | undefined): string[]
  getDirTopologicalSorting(dirs: string[]): string[]
  packageJsonToAnalysisBlock(value: IPackageJson): AnalysisBlockItem | null
  dirToAnalysisBlock(value: string): AnalysisBlockItem | null
  dataToAnalysisDiagram(value: any, key: keyof AnalysisBlockItem): AnalysisBlockItem | null
}
```

### fileStore
### packageManager
### executeManage
### argv
### args
### ttArgv
### argvValue
## 方法
### create
### assignConfig
### assignOptions