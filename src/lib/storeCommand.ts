import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { getStageInfo, getWorkInfo, getVersionDiffFile } from '../utils/git'
import { createCommand, runCmds, warn } from '../utils'
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
  //   const diffDirs = await this.getWorkDiffFile()
  //   await this.commandRun(diffDirs, type)
  // }

  async workCommand (cmd: string) {
    const diffDirs = await this.getWorkDiffFile()
    const result = this.commandRun(diffDirs, cmd)
    return result
  }

  async stageCommand (cmd: string) {
    const diffDirs = await this.getStageDiffFile()
    const result = this.commandRun(diffDirs, cmd)
    return result
  }

  async repositoryCommand (cmd: string) {
    const diffDirs = await this.getRepositoryDiffFile()
    const result = this.commandRun(diffDirs, cmd)
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

  private async getWorkDiffFile () {
    const files = await getWorkInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  private async getStageDiffFile () {
    const files = await getStageInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  private async getRepositoryDiffFile () {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }),
    )
  }

  private async forPack (relatedPackagesDir: string[], callback: ForPackCallback) {
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]
      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index)
    }
  }

  private commandRun (diffDirs: string[], cmd: string) {
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(diffDirs)
    const cmds = createCommand(cmd, orderDirs)

    if (cmds.length) {
      return runCmds(cmds)
    }
    else {
      warn(WARN_NOW_RUN)
    }
  }
}
type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void
