import { readFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import simpleGit from 'simple-git'
import { getPackagesJSON } from './utils'
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
  packageJSON: IPackageJson
  filePath: string
  relyMyDir: string[]
  myRelyPackageName: string[]
}
export type ContextAnalysisDiagram = Record<string, AnalysisBlockObject>
export type SetAnalysisBlockObject = Set<AnalysisBlockObject>
export class Context {
  options: ExecuteCommandOptions
  contextAnalysisDiagram!: ContextAnalysisDiagram
  constructor (options: ExecuteCommandOptions) {
    this.options = options
  }

  async initData () {
    const rootFIle = 'package.json'
    const rootPackage = await readFile(rootFIle)
    const { dirs, filesPath } = await getPackagesDir(this.options.packagesPath)
    const packagesJSON = await getPackagesJSON(filesPath)
    this.createContextAnalysisDiagram(
      ['', ...dirs],
      [rootFIle, ...filesPath],
      [rootPackage, ...packagesJSON],
    )
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
        .map(key => this.contextAnalysisDiagram[key].packageJSON)
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
        .filter(item => item)
        .map(key => this.contextAnalysisDiagram[key].packageJSON)
    }
    else {
      return []
    }
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

  cmdAnalysis (cmd: CMD) {
    switch (cmd) {
      case 'version':
        cmdVersion(this)
        return
      case 'publish':
        cmdPublish(this)
    }
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
      const packageJSON = packagesJSON[index]
      setRelyMyDirhMap(dir, packageJSON, relyMyMap)
      this.contextAnalysisDiagram[dir] = {
        packageJSON,
        filePath: filesPath[index],
        relyMyDir: relyMyMap[packageJSON.name as string],
        myRelyPackageName: getMyRelyPackageName(packagesName, packageJSON),
      }
    })
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
    const git = simpleGit()
    const tag = await getTag(type, git)
    // 没有打过标记
    if (!tag) {
      return true
    }
    const tagCommitId = await getTagCommitId(tag, git)
    const newestCommitId = await getNewestCommitId(git)
    return getChangeFiles(newestCommitId, tagCommitId as string, git)
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
    const packageJSON = this.contextAnalysisDiagram[dir].packageJSON
    return `${packageJSON.name}@${packageJSON.version}`
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
