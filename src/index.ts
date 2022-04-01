import { readJSON } from 'fs-extra'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import { getFiles } from './utils'
import {
  getPackagesName,
  createRelyMyDirMap,
  setRelyMyDirhMap,
  getMyRelyPackageName,
} from './utils/analysisDiagram'
import { cmdVersion, cmdPublish } from './cmd'
import type { ExecuteCommandOptions } from './defaultOptions'
import type { TagType } from './git'
import {
  getTag,
  getNewestCommitId,
  getTagCommitId,
  getChangeFiles,
} from './git'

export interface AnalysisBlockObject {
  packageJson: IPackageJson
  filePath: string
  relyMyDir: string[]
  myRelyPackageName: string[]
}
export type ContextAnalysisDiagram = Record<string, AnalysisBlockObject>
export type SetAnalysisBlockObject = Set<AnalysisBlockObject>
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
    const result = new Context(options, git, version)
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
        .filter(item => item)
        .map(key => key)
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
    const { dirs, filesPath } = await getPackagesDir(this.options.packagesPath)
    const packagesJSON = await getFiles(filesPath)

    this.createContextAnalysisDiagram(
      [this.rootDir, ...dirs],
      [this.rootFilePath, ...filesPath],
      [this.rootPackageJson, ...packagesJSON],
    )
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
      this.contextAnalysisDiagram[dir] = {
        packageJson,
        filePath: filesPath[index],
        relyMyDir: relyMyMap[packageJson.name as string],
        myRelyPackageName: getMyRelyPackageName(packagesName, packageJson),
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

  async forDiffPack (callback: ForPackCallback, type: TagType) {
    const files = await this.getChangeFiles(type)
    const dirtyPackagesDir = this.getDirtyPackagesDir(files)

    for (let index = 0; index < dirtyPackagesDir.length; index++) {
      const dir = dirtyPackagesDir[index]

      await callback(
        this.contextAnalysisDiagram[dir],
        dir,
        index,
        this,
      )
    }
  }

  async getChangeFiles
  (type: TagType): Promise<string[] | boolean | undefined> {
    const tag = await getTag(type, this.git)

    // 没有打过标记
    if (!tag) {
      return true
    }

    const tagCommitId = await getTagCommitId(tag, this.git)
    const newestCommitId = await getNewestCommitId(this.git)

    return getChangeFiles(newestCommitId, tagCommitId as string, this.git)
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

  getNameAntVersionPackages (dir: string) {
    const packageJson = this.contextAnalysisDiagram[dir].packageJson
    return `${packageJson.name}@${packageJson.version}`
  }
}
export type CMD = 'version' | 'publish'
export interface CMDArgs {
  path: string
  cache: boolean
}
export type ForPackCallback = (
  analysisBlock: AnalysisBlockObject,
  dir: string,
  index: number,
  context: Context
) => Promise<any> | void
