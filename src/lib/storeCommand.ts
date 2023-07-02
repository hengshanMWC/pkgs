import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { getStageInfo, getWorkInfo, getVersionDiffFile } from '../utils/git'
import { createCommand, runCmdList, warn } from '../utils'
import { WARN_NOW_RUN } from '../constant'
import type { AnalysisBlockItem, ContextAnalysisDiagram } from './analysisDiagram'
export {
  StoreCommand,
  ForPackCallback,
}

class StoreCommand {
  contextAnalysisDiagram: ContextAnalysisDiagram
  git: SimpleGit
  constructor (
    contextAnalysisDiagram: ContextAnalysisDiagram,
    git: SimpleGit = simpleGit(),
  ) {
    this.contextAnalysisDiagram = contextAnalysisDiagram
    this.git = git
  }

  // async allCommand (type: string) {
  //   const diffDirs = await this.workDiffFile()
  //   await this.commandRun(diffDirs, type)
  // }

  async workCommand (cmd: string) {
    const diffDirs = await this.workDiffFile()
    const result = await this.commandBatchRun(diffDirs, cmd)
    return result
  }

  async stageCommand (cmd: string) {
    const diffDirs = await this.stageDiffFile()
    const result = await this.commandBatchRun(diffDirs, cmd)
    return result
  }

  async repositoryCommand (cmd: string) {
    const diffDirs = await this.repositoryDiffFile()
    const result = await this.commandBatchRun(diffDirs, cmd)
    return result
  }

  // 拿到相关包的文件修改范围
  async getFileList () {
    const getFileList = this.contextAnalysisDiagram.allPackagesJSON
      .map(({ name, version }) => getVersionDiffFile(`${name}@${version}`, this.git))
    const result = await Promise.all(getFileList)
    return result
  }

  async getRepositoryInfo () {
    const fileList = await this.getFileList()

    const relatedPackagesDir: Set<string> = new Set()
    const dirs = this.contextAnalysisDiagram.allDirs

    // 收集包对应的dir
    fileList.forEach((file, index) => {
      if (file === true) {
        relatedPackagesDir.add(dirs[index])
      }
      else {
        const dirList = this.contextAnalysisDiagram.getRelatedPackagesDir(file)
        dirList.forEach(dir => relatedPackagesDir.add(dir))
      }
    })
    return [...relatedPackagesDir]
  }

  async forRepositoryDiffPack (callback: ForPackCallback) {
    const relatedPackagesDir = await this.getRepositoryInfo()
    await this.forPack(relatedPackagesDir, callback)
  }

  async workDiffFile () {
    const files = await getWorkInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  async stageDiffFile () {
    const files = await getStageInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  async repositoryDiffFile () {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }),
    )
  }

  async commandBatchRun (diffDirs: string[], cmdStr: string) {
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(diffDirs)
    const cmd = createCommand(cmdStr, orderDirs)

    if (cmd.length) {
      const cmdStrList = await runCmdList(cmd)
      return cmdStrList
    }
    else {
      warn(WARN_NOW_RUN)
    }
  }

  private async forPack (relatedPackagesDir: string[], callback: ForPackCallback) {
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]
      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index)
    }
  }
}
type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void
