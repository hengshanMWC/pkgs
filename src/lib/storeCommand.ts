import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type { ExecuteCommandConfig } from '../defaultOptions'
import type { DiffFile, TagType } from '../utils/git'
import { getRepositoryInfo, getStageInfo, getWorkInfo, gitDiffTag } from '../utils/git'
import { createCommand, runCmds, warn } from '../utils'
import { WARN_NOW_RUN } from '../constant'
import type { AnalysisBlockItem, ContextAnalysisDiagram } from './analysisDiagram'
export {
  StoreCommand,
  ForPackCallback,
}

class StoreCommand {
  contextAnalysisDiagram: ContextAnalysisDiagram
  rootPackage: ExecuteCommandConfig['rootPackage']
  git: SimpleGit
  constructor (
    contextAnalysisDiagram: ContextAnalysisDiagram,
    rootPackage: ExecuteCommandConfig['rootPackage'],
    git: SimpleGit = simpleGit(),
  ) {
    this.contextAnalysisDiagram = contextAnalysisDiagram
    this.rootPackage = rootPackage
    this.git = git
  }

  // async allCommand (type: string) {
  //   const diffDirs = await this.getWorkDiffFile()
  //   await this.commandRun(diffDirs, type)
  // }

  async workCommand (type: string) {
    const diffDirs = await this.getWorkDiffFile()
    const result = this.commandRun(diffDirs, type)
    return result
  }

  async stageCommand (type: string) {
    const diffDirs = await this.getStageDiffFile()
    const result = this.commandRun(diffDirs, type)
    return result
  }

  async repositoryCommand (type: string) {
    const diffDirs = await this.getRepositoryDiffFile(type)
    const result = this.commandRun(diffDirs, type)
    // TODO 到时候提出来给调用方
    await gitDiffTag(type)
    return result
  }

  async forRepositoryDiffPack (callback: ForPackCallback, type: TagType) {
    const files = await getRepositoryInfo(type, this.git)
    await this.forPack(files, callback)
  }

  private async getWorkDiffFile () {
    const files = await getWorkInfo(this.git)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(files, source => {
        cd(source)
      }),
    )
  }

  private async getStageDiffFile () {
    const files = await getStageInfo(this.git)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(files, source => {
        cd(source)
      }),
    )
  }

  private async getRepositoryDiffFile (type: string) {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }, type),
    )
  }

  private async forPack (files: DiffFile, callback: ForPackCallback) {
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]
      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index)
    }
  }

  private getRunDirs (dirs: string[]) {
    return this.rootPackage ? dirs : dirs.filter(dir => dir)
  }

  private commandRun (diffDirs: string[], type: string) {
    const dirs = this.getRunDirs(diffDirs)
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(dirs)
    const cmds = createCommand(type, orderDirs)

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
