import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
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

  async cmdAnalysis (cmd: CMD) {
    switch (cmd) {
      case 'version':
        await cmdVersion(this)
        return
      case 'publish':
        await cmdPublish(this)
    }
  }

  /** run start **/
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

  async getWorkDiffFile () {
    const files = await getWorkInfo(this.git)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(files, source => {
        cd(source)
      }),
    )
  }

  async getStageDiffFile () {
    const files = await getStageInfo(this.git)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(files, source => {
        cd(source)
      }),
    )
  }

  async getRepositoryDiffFile (type: string) {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }, type),
    )
  }

  /** run end **/

  /** utils start **/

  // 也许运行命令的时候，需要一个正确的顺序
  createOrderArray (dirs: string[]) {
    const result: string[] = []
    const stack: string[] = []

    this.contextAnalysisDiagram.dependencyTracking(dirs, result, stack, function () {
      const value = stack[stack.length - 1]
      if (value !== undefined && !result.includes(value)) {
        result.push(value)
      }
      stack.pop()
    })
    return result
  }

  async commandRun (diffDirs: string[], type: string) {
    const dirs = this.getRunDirs(diffDirs)
    const orderDirs = this.createOrderArray(dirs)
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

  async forRepositoryDiffPack (callback: ForPackCallback, type: TagType) {
    const files = await getRepositoryInfo(type, this.git)
    await this.forPack(files, callback)
  }

  private async forPack (files: DiffFile, callback: ForPackCallback) {
    const dirtyPackagesDir = this.contextAnalysisDiagram.getDirtyPackagesDir(files)
    for (let index = 0; index < dirtyPackagesDir.length; index++) {
      const dir = dirtyPackagesDir[index]

      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index, this)
    }
  }

  private getRunDirs (dirs: string[]) {
    return this.options.rootPackage ? dirs : dirs.filter(dir => dir)
  }

  packageJsonToAnalysisBlock (packageJson: IPackageJson) {
    for (const key in this.contextAnalysisDiagram.analysisDiagram) {
      const analysisBlock = this.contextAnalysisDiagram.analysisDiagram[key]

      if (analysisBlock.packageJson === packageJson) {
        return analysisBlock
      }
    }
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

  /** utils end **/
}
export type CMD = 'version' | 'publish'
type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
  context: Context
) => Promise<any> | void
