import type IPackageJson from '@ts-type/package-dts'
import type { ExecuteCommandConfig } from '../defaultOptions'

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
