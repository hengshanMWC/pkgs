import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  createCommand,
  runCmds,
  warn,
  getYamlPackages,
} from './utils'
import { cmdVersion, cmdPublish } from './cmd'
import { ContextAnalysisDiagram } from './analysisDiagram'
import type { AnalysisBlockItem } from './analysisDiagram'
import type { ExecuteCommandOptions } from './defaultOptions'
import type { TagType, DiffFile } from './git'
import { gitDiffTag, getRepositoryInfo, getStageInfo, getWorkInfo } from './git'
import { WARN_NOW_RUN, PACKAGES_PATH } from './constant'
import { testEmit } from './utils/test'

export class Context {
  options: ExecuteCommandOptions
  git: SimpleGit
  contextAnalysisDiagram!: ContextAnalysisDiagram
  version?: string

  constructor (
    options: ExecuteCommandOptions,
    git: SimpleGit = simpleGit(),
    version?: string,
  ) {
    this.options = options
    this.git = git
    this.version = version
  }

  static async create (
    options: ExecuteCommandOptions,
    cmd?: CMD,
    git: SimpleGit = simpleGit(),
    version?: string,
  ) {
    const attrOptions = options

    // 同步pnpm-workspace.yaml的packagesPath
    if (!attrOptions.packagesPath) {
      try {
        attrOptions.packagesPath = await getYamlPackages()
      }
      catch {
        attrOptions.packagesPath = PACKAGES_PATH
      }
    }

    const result = new Context(attrOptions, git, version)
    const contextAnalysisDiagram = new ContextAnalysisDiagram(result.options.packagesPath)
    await contextAnalysisDiagram.initData()
    result.contextAnalysisDiagram = contextAnalysisDiagram
    if (cmd) {
      await result.cmdAnalysis(cmd)
    }
    return result
  }

  get allDirs () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(key => key)
    }
    else {
      return []
    }
  }

  get allFilesPath () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(
        key => this.contextAnalysisDiagram.analysisDiagram[key].filePath,
      )
    }
    else {
      return []
    }
  }

  get allPackagesJSON () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(
        key => this.contextAnalysisDiagram.analysisDiagram[key].packageJson,
      )
    }
    else {
      return []
    }
  }

  get dirs () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).filter(key => key)
    }
    else {
      return []
    }
  }

  get filesPath () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram)
        .filter(item => item)
        .map(key => this.contextAnalysisDiagram.analysisDiagram[key].filePath)
    }
    else {
      return []
    }
  }

  get packagesJSON () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram)
        .filter(key => key)
        .map(key => this.contextAnalysisDiagram.analysisDiagram[key].packageJson)
    }
    else {
      return []
    }
  }

  // start: run [options] <cmd> [mode]  run diff scripts.
  async workCommand (type: string) {
    const diffDirs = await this.getWorkDiffFile()
    this.commandRun(diffDirs, type)
  }

  async stageCommand (type: string) {
    const diffDirs = await this.getStageDiffFile()
    this.commandRun(diffDirs, type)
  }

  async repositoryCommand (type: string) {
    const diffDirs = await this.getRepositoryDiffFile(type)
    const status = await this.commandRun(diffDirs, type)
    if (status === 'allSuccess') {
      gitDiffTag(type)
    }
  }
  // end

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

  getCorrectOptionValue (
    cmd: CMD,
    key: keyof ExecuteCommandOptions &
    keyof ExecuteCommandOptions['version'] &
    keyof ExecuteCommandOptions['publish'],
  ) {
    const options = this.options
    const cmdObject = options[cmd]

    if (typeof cmdObject === 'object') {
      return cmdObject[key] === undefined ? options[key] : cmdObject[key]
    }
    else {
      return options[key]
    }
  }

  async forRepositoryDiffPack (callback: ForPackCallback, type: TagType) {
    const files = await getRepositoryInfo(type, this.git)
    await this.forPack(files, callback)
  }

  private async cmdAnalysis (cmd: CMD) {
    switch (cmd) {
      case 'version':
        await cmdVersion(this)
        return
      case 'publish':
        await cmdPublish(this)
    }
  }

  private async forPack (files: DiffFile, callback: ForPackCallback) {
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]

      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index)
    }
  }

  private getRunDirs (dirs: string[]) {
    return this.options.rootPackage ? dirs : dirs.filter(dir => dir)
  }

  private async commandRun (diffDirs: string[], type: string) {
    const dirs = this.getRunDirs(diffDirs)
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(dirs)
    const cmds = createCommand(type, orderDirs)

    if (cmds.length) {
      if (process.env.NODE_ENV === 'test') {
        testEmit(cmds)
        return 'allSuccess'
      }
      else {
        return runCmds(cmds)
      }
    }
    else {
      warn(WARN_NOW_RUN)
    }
  }
}
export type CMD = 'version' | 'publish'
export type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void
