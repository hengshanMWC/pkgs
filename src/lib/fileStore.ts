import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import type { DiffFile } from '../utils/git'
import { getStageInfo, getWorkInfo, getVersionDiffFile } from '../utils/git'
import { getPackageNameVersion, gtPackageJson } from '../utils/packageJson'
import { fileMatch } from '../utils'
import type { FileStoreApi, ForPackCallback, ContextAnalysisDiagramApi } from '.'
export {
  FileStore,
}

class FileStore implements FileStoreApi {
  contextAnalysisDiagram: ContextAnalysisDiagramApi
  git: SimpleGit
  constructor (
    contextAnalysisDiagram: ContextAnalysisDiagramApi,
    git: SimpleGit = simpleGit(),
  ) {
    this.contextAnalysisDiagram = contextAnalysisDiagram
    this.git = git
  }

  // 所有包路径
  getAllFIle () {
    return this.contextAnalysisDiagram.allDirs
  }

  // 工作区包路径
  async workDiffFile () {
    const files = await getWorkInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.dirToAnalysisBlockFor(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  // 暂存区包路径
  async stageDiffFile () {
    const files = await getStageInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.dirToAnalysisBlockFor(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  // 版本库diff包路径
  async repositoryDiffFile (separator?: string) {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }, separator),
    )
  }

  // 版本库sync包路径
  async repositorySyncFile (separator?: string) {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositorySyncPack(source => {
        cd(source)
      }, separator),
    )
  }

  async forRepositorySyncPack (callback: ForPackCallback, separator = 'v') {
    const file = await this.getFileSyncList(separator)
    if (file) {
      const relatedPackagesDir = await this.getRepositoryInfo([file])
      await this.dirToAnalysisBlockFor(relatedPackagesDir, callback)
    }
  }

  async forRepositoryDiffPack (callback: ForPackCallback, separator = 'v') {
    const files = await this.getDiffFileList(packageJson => getPackageNameVersion(
      packageJson, separator,
    ))
    const relatedPackagesDir = await this.getRepositoryInfo(files)
    await this.dirToAnalysisBlockFor(relatedPackagesDir, callback)
  }

  async getFileSyncList (separator?: string) {
    const packageJson = this.contextAnalysisDiagram.allPackagesJSON
      .reduce(
        (aPackageJson, bPackageJson) => gtPackageJson(aPackageJson, bPackageJson),
      )
    let result: DiffFile
    if (packageJson && packageJson.version) {
      result = await getVersionDiffFile(separator + packageJson.version)
    }
    return result
  }

  // 拿到相关包的文件修改范围
  async getDiffFileList (createVersion: (packageJson: IPackageJson) => string) {
    const fileList = this.contextAnalysisDiagram.allPackagesJSON
      .filter(packageJson => packageJson)
      .map(packageJson => getVersionDiffFile(
        createVersion(packageJson as IPackageJson),
        this.git))
    const result = await Promise.all(fileList)
    return result
  }

  async getRepositoryInfo (fileList: DiffFile[]) {
    const relatedPackagesDir: Set<string> = new Set()
    const dirs = this.contextAnalysisDiagram.allDirs

    // 收集包对应的dir
    fileList.forEach((files, index) => {
      const dir = dirs[index]
      if (files === true) {
        relatedPackagesDir.add(dir)
      }
      else if (files && fileMatch(files, dir)) {
        relatedPackagesDir.add(dir)
      }
    })
    return [...relatedPackagesDir]
  }

  private async dirToAnalysisBlockFor (relatedPackagesDir: string[], callback: ForPackCallback) {
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]
      const analysisBlock = this.contextAnalysisDiagram.dirToAnalysisDiagram(dir)
      if (analysisBlock) {
        await callback(analysisBlock, index)
      }
    }
  }
}
