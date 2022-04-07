import { readJSON } from 'fs-extra'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import { getJSONs, createCommand, runCmds, warn, getYamlPackages } from './utils'
import {
  getRelyAttrs,
  getPackagesName,
  createRelyMyDirMap,
  setRelyMyDirhMap,
  getMyRelyPackageName,
} from './utils/analysisDiagram'
import { cmdVersion, cmdPublish } from './cmd'
import type { ExecuteCommandOptions } from './defaultOptions'
import type { TagType, DiffFile } from './git'
import {
  gitDiffTag,
  getRepositoryInfo,
  getStageInfo,
  getWorkInfo,
} from './git'
import { WARN_NOW_RUN, PACKAGES_PATH } from './constant'
import { testEmit } from './utils/test'
export interface AnalysisBlockObject {
  packageJson: IPackageJson
  filePath: string
  dir: string
  relyMyDir: string[]
  myRelyDir: string[]
}
type ContextAnalysisDiagram = Record<string, AnalysisBlockObject>
export type SetAnalysisBlockObject = Set<AnalysisBlockObject>
// type DiffType = 'work' | 'stage' | 'repository'
export class Context {
  options: ExecuteCommandOptions
  git: SimpleGit
  contextAnalysisDiagram!: ContextAnalysisDiagram
  rootPackageJson!: IPackageJson
  rootFilePath = 'package.json'
  rootDir = ''
  version?: string

  constructor (options: ExecuteCommandOptions, git: SimpleGit = simpleGit(), version?: string) {
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

    await result.initData()
    if (cmd) {
      await result.cmdAnalysis(cmd)
    }
    return result
  }

  get allDirs () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram).map(key => key)
    }
    else {
      return []
    }
  }

  get allFilesPath () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram)
        .map(key => this.contextAnalysisDiagram[key].filePath)
    }
    else {
      return []
    }
  }

  get allPackagesJSON () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram)
        .map(key => this.contextAnalysisDiagram[key].packageJson)
    }
    else {
      return []
    }
  }

  get dirs () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram)
        .filter(key => key)
    }
    else {
      return []
    }
  }

  get filesPath () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram)
        .filter(item => item)
        .map(key => this.contextAnalysisDiagram[key].filePath)
    }
    else {
      return []
    }
  }

  get packagesJSON () {
    if (this.contextAnalysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram)
        .filter(key => key)
        .map(key => this.contextAnalysisDiagram[key].packageJson)
    }
    else {
      return []
    }
  }

  async initData () {
    this.rootPackageJson = await readJSON(this.rootFilePath)
    const values: [string[], string[], IPackageJson[]] = [
      [this.rootDir],
      [this.rootFilePath],
      [this.rootPackageJson],
    ]
    if (this.options.packagesPath) {
      try {
        const { dirs, filesPath } = await getPackagesDir(this.options.packagesPath)
        const packagesJSON = await getJSONs(filesPath)
        values[0].push(...dirs)
        values[1].push(...filesPath)
        values[2].push(...packagesJSON)
      }
      catch {}
    }

    this.createContextAnalysisDiagram(...values)
  }

  createContextAnalysisDiagram (
    dirs: string[],
    filesPath: string[],
    packagesJSON: IPackageJson[],
  ) {
    const packagesName = getPackagesName(packagesJSON)
    const relyMyMap = createRelyMyDirMap(packagesName)
    this.contextAnalysisDiagram = {}

    dirs.forEach((dir, index) => {
      const packageJson = packagesJSON[index]
      setRelyMyDirhMap(dir, packageJson, relyMyMap)
      const names = getMyRelyPackageName(packagesName, packageJson)
      const myRelyDir = names.map(name => {
        const i = packagesJSON.findIndex(item => item.name === name)
        return dirs[i]
      })
      this.contextAnalysisDiagram[dir] = {
        packageJson,
        dir,
        filePath: filesPath[index],
        relyMyDir: relyMyMap[packageJson.name as string],
        myRelyDir,
      }
    })
  }

  getCorrectOptionValue<K extends keyof ExecuteCommandOptions['version']>(
    cmd: 'version', key: keyof ExecuteCommandOptions['version']
  ): ExecuteCommandOptions['version'][K]

  getCorrectOptionValue<K extends keyof ExecuteCommandOptions['publish']>(
    cmd: 'publish', key: keyof ExecuteCommandOptions['publish']
  ): ExecuteCommandOptions['publish'][K]

  getCorrectOptionValue<U extends CMD, K extends keyof ExecuteCommandOptions[U]>
  (
    cmd: CMD,
    key: keyof ExecuteCommandOptions[U],
  ): ExecuteCommandOptions[U][K] {
    const options: any = this.options
    const cmdObject = options[cmd] as ExecuteCommandOptions[U]

    if (typeof cmdObject === 'object') {
      return cmdObject[key] === undefined ? options[key] : cmdObject[key]
    }
    else {
      return options[key]
    }
  }

  getRunDirs (dirs: string[]) {
    return this.options.rootPackage ? dirs : dirs.filter(dir => dir)
  }

  // 也许运行命令的时候，需要一个正确的顺序
  createOrderArray (dirs: string[]) {
    const result: string[] = []
    const stack: string[] = []
    this.dependencyTracking(dirs, result, stack, function () {
      const value = stack.at(-1)
      if (value !== undefined && !result.includes(value)) {
        result.push(value)
      }
      stack.pop()
    })
    return result
  }

  dependencyTracking (dirs: string[], result: string[], stack: string[], cd: Function) {
    dirs.forEach(dir => {
      if (stack.includes(dir) || result.includes(dir)) return
      stack.push(dir)

      const { myRelyDir } = this.contextAnalysisDiagram[dir]
      myRelyDir.forEach(item => {
        if (!stack.includes(item)) {
          stack.push(item)
          const { myRelyDir } = this.contextAnalysisDiagram[item]
          this.dependencyTracking(myRelyDir, result, stack, cd)
          cd()
        }
      })

      cd()
    })
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
    const triggerSign: SetAnalysisBlockObject = new Set()
    await this.forWorkDiffPack(source => {
      this.getDirtyFile(source, triggerSign)
    })
    return [...triggerSign].map(item => item.dir)
  }

  async getStageDiffFile () {
    const triggerSign: SetAnalysisBlockObject = new Set()
    await this.forStageDiffPack(source => {
      this.getDirtyFile(source, triggerSign)
    })
    return [...triggerSign].map(item => item.dir)
  }

  async getRepositoryDiffFile (type: string) {
    const triggerSign: SetAnalysisBlockObject = new Set()
    await this.forRepositoryDiffPack(source => {
      this.getDirtyFile(source, triggerSign)
    }, type)
    return [...triggerSign].map(item => item.dir)
  }
  /** run end **/

  getDirtyFile (source: AnalysisBlockObject, triggerSign: SetAnalysisBlockObject) {
    if (triggerSign.has(source)) return
    triggerSign.add(source)
    const relyMyDir = source.relyMyDir
    // 没有依赖则跳出去
    if (!Array.isArray(source.relyMyDir)) return
    const relyAttrs = getRelyAttrs().reverse()

    for (let i = 0; i < relyMyDir.length; i++) {
      const relyDir = relyMyDir[i]
      const analysisBlock = this.contextAnalysisDiagram[relyDir]
      if (triggerSign.has(analysisBlock)) continue

      for (let j = 0; j < relyAttrs.length; j++) {
        const key = relyAttrs[i]
        const relyKeyObject = analysisBlock.packageJson[key]
        if (!relyKeyObject) return
        this.getDirtyFile(analysisBlock, triggerSign)
      }
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

  packageJsonToAnalysisBlock (packageJson: IPackageJson) {
    for (const key in this.contextAnalysisDiagram) {
      const analysisBlock = this.contextAnalysisDiagram[key]

      if (analysisBlock.packageJson === packageJson) {
        return analysisBlock
      }
    }
  }

  async forRepositoryDiffPack (callback: ForPackCallback, type: TagType) {
    const files = await getRepositoryInfo(type, this.git)
    await this.forPack(files, callback)
  }

  async forStageDiffPack (callback: ForPackCallback) {
    const files = await getStageInfo(this.git)
    await this.forPack(files, callback)
  }

  async forWorkDiffPack (callback: ForPackCallback) {
    const files = await getWorkInfo(this.git)
    await this.forPack(files, callback)
  }

  async forPack (files: DiffFile, callback: ForPackCallback) {
    const dirtyPackagesDir = this.getDirtyPackagesDir(files)
    for (let index = 0; index < dirtyPackagesDir.length; index++) {
      const dir = dirtyPackagesDir[index]

      await callback(
        this.contextAnalysisDiagram[dir],
        index,
        this,
      )
    }
  }

  getDirtyPackagesDir (files: string[] | boolean | undefined) {
    const keys = Object.keys(this.contextAnalysisDiagram)
    if (files === true) {
      return keys
    }
    else if (Array.isArray(files)) {
      return keys
        .filter(key => files.some(file => file.includes(key)))
    }
    else {
      return []
    }
  }
}
export type CMD = 'version' | 'publish'
type ForPackCallback = (
  analysisBlock: AnalysisBlockObject,
  index: number,
  context: Context
) => Promise<any> | void
