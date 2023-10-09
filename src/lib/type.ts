import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import type { ExecuteCommandConfig } from '../defaultOptions'
import type { CommandResult, HandleMainResult } from '../plugin'

export interface ContextParams {
  config?: ExecuteCommandConfig
  git?: SimpleGit
  argv?: string[]
  args?: any[]
  ttArgv?: string[]
}

export interface AnalysisBlockItem {
  packageJson: IPackageJson
  name: string
  filePath: string
  dir: string
  relyMyDir: string[] // 依赖我的包
  myRelyDir: string[] // 我依赖的包
}

export type AnalysisDiagram = Record<string, AnalysisBlockItem>

export interface ContextAnalysisDiagramApi {
  // 工作区
  packagesPath: ExecuteCommandConfig['packagesPath']
  // 图表依赖
  analysisDiagram: AnalysisDiagram
  get allDirs(): string[] // 获取所有包地址
  get allFilesPath(): string[] // 获取所有包package.json地址
  get allPackagesJSON(): IPackageJson<unknown>[] // 获取所有包的package.json
  initData(): Promise<this> // 初始化图表依赖
  // 获取依赖我的包目录（例如测试的时候，需要对直接和间接依赖了当前包的包也进行测试，才能确定是否影响
  getRelyMyDir(forCD: (cd: (source: AnalysisBlockItem) => void) => Promise<void>): Promise<string[]>
  // 通过文件路径获取包目录
  getRelatedPackagesDir(files: string[] | boolean | undefined): string[]
  // 获取我依赖的包目录（拓扑排序，例如构建之前，需要先构建我依赖的包，从而才能正确构建当前包，不然我依赖的包如果没有构建物，会导致构建失败
  getMyRelyDir(dirs: string[]): string[]
  // package.json交换包信息
  packageJsonToAnalysisBlock(value: IPackageJson): AnalysisBlockItem | null
  // 目录交换包信息
  dirToAnalysisBlock(value: string): AnalysisBlockItem | null
}

export type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void

export interface FileStoreApi {
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

export interface ExecuteApi {
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
