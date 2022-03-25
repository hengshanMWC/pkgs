import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import simpleGit from 'simple-git'
import { getPackagesJSON } from './utils'
import {
  getPackagesName,
  createRelyMyMap,
  setRelyMyhMap,
  getMyRely,
} from './utils/analysisDiagram'
import { cmdVersion, cmdPublish } from './cmd'
import type { ExecuteCommandOptions } from './defaultOptions'
import { defaultOptions } from './defaultOptions'
import type { TagType } from './git'
import {
  getTag,
  getNewestCommitId,
  getTagCommitId,
  getChangeFiles,
} from './git'

export interface AnalysisDiagramObject {
  packageJSON: IPackageJson
  filePath: string
  relyMy: string[]
  myRely: string[]
}
export type ContextAnalysisDiagram = Record<string, AnalysisDiagramObject>
export class Context {
  options: ExecuteCommandOptions
  contextAnalysisDiagram!: ContextAnalysisDiagram
  constructor (options: Partial<ExecuteCommandOptions> = {}) {
    this.options = Object.assign(defaultOptions, options)
  }

  async initData () {
    const rootFIle = 'package.json'
    const [rootPackage] = await getPackagesJSON([rootFIle])
    const { dirs, filesPath } = await getPackagesDir(this.options.packagesPath)
    const packagesJSON = await getPackagesJSON(filesPath)
    this.createContextAnalysisDiagram(
      ['', ...dirs],
      [rootFIle, ...filesPath],
      [rootPackage, ...packagesJSON],
    )
  }

  get rootPackage () {
    return this.contextAnalysisDiagram?.[''] || {}
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

  createContextAnalysisDiagram (
    dirs: string[],
    filesPath: string[],
    packagesJSON: IPackageJson[],
  ) {
    const packagesName = getPackagesName(packagesJSON)
    const relyMyMap = createRelyMyMap(packagesName)
    this.contextAnalysisDiagram = {}
    dirs.forEach((dir, index) => {
      const packageJSON = packagesJSON[index]
      setRelyMyhMap(dir, packageJSON, relyMyMap)
      this.contextAnalysisDiagram[dir] = {
        packageJSON,
        filePath: filesPath[index],
        relyMy: relyMyMap[packageJSON.name as string],
        myRely: getMyRely(packagesName, packageJSON),
      }
    })
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
    const tag = await getTag(type, this.options.mode, git)
    // 没有打过标记
    if (!tag) {
      return true
    }
    const tagCommitId = await getTagCommitId(tag, git)
    const newestCommitId = await getNewestCommitId(git)
    return getChangeFiles(newestCommitId, tagCommitId as string, git)
  }

  getDirtyPackagesDir (files: string[] | boolean | undefined) {
    if (files === true) {
      return Object.keys(this.contextAnalysisDiagram)
    }
    else if (Array.isArray(files)) {
      return Object
        .keys(this.contextAnalysisDiagram)
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
  analysisDiagram: AnalysisDiagramObject,
  dir: string,
  index: number,
  context: Context
) => Promise<any> | void
