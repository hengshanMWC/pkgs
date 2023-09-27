import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import type { ExecuteCommandConfig } from '../defaultOptions'
import type { DiffFile } from '../utils/git'
import type { CommandResult, HandleMainResult } from '../command'

export interface AnalysisBlockItem {
  packageJson: IPackageJson
  name: string
  filePath: string
  dir: string
  relyMyDir: string[] // 依赖我的包
  myRelyDir: string[] // 我依赖的包
}

export type AnalysisDiagram = Record<string, AnalysisBlockItem>

export interface contextAnalysisDiagramApi {
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
  dirToAnalysisDiagram(value: string): AnalysisBlockItem | null
  dataToAnalysisDiagram(value: any, key: keyof AnalysisBlockItem): AnalysisBlockItem | null
}

export type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void

export interface FileStoreApi {
  contextAnalysisDiagram: contextAnalysisDiagramApi
  git: SimpleGit
  getAllFIle(): string[]
  workDiffFile(): Promise<string[]>
  stageDiffFile(): Promise<string[]>
  repositoryDiffFile(separator?: string): Promise<string[]>
  repositorySyncFile(separator?: string): Promise<string[]>
  forRepositorySyncPack(callback: ForPackCallback, separator?: string): Promise<void>
  forRepositoryDiffPack(callback: ForPackCallback, separator?: string): Promise<void>
  getFileSyncList(separator?: string): Promise<DiffFile>
  getDiffFileList(createVersion: (packageJson: IPackageJson) => string): Promise<DiffFile[]>
  getRepositoryInfo(fileList: DiffFile[]): Promise<string[]>
}

export interface ExecuteApi {
  enterMainResult(commandMainResult: HandleMainResult): this
  setAffectedAnalysisBlockList(analysisBlockLis: AnalysisBlockItem[]): this
  getCommandData(): {
    analysisBlockList: AnalysisBlockItem[]
    commandData: CommandResult<any>[]
  }
  execute(): Promise<any[]>
}
