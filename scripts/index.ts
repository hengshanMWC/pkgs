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
  rootPackage!: IPackageJson
  dirs!: string[]
  filesPath!: string[]
  packagesJSON!: IPackageJson[]
  contextAnalysisDiagram!: ContextAnalysisDiagram
  constructor (options: Partial<ExecuteCommandOptions> = {}) {
    this.options = Object.assign(defaultOptions, options)
  }

  async initData () {
    const [rootPackage] = await getPackagesJSON(['package.json'])
    this.rootPackage = rootPackage
    const { dirs, filesPath } = await getPackagesDir(this.options.packagesPath)
    this.dirs = dirs
    this.filesPath = filesPath
    this.packagesJSON = await getPackagesJSON(filesPath)
    this.createContextAnalysisDiagram(dirs, filesPath, this.packagesJSON)
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

  async forSyncPack (callback: ForPackCallback) {
    for (let index = 0; index < this.packagesJSON.length; index++) {
      await callback(
        this.packagesJSON[index],
        index,
        this,
      )
    }
  }

  // async forDiffPack (callback: ForPackCallback, type: TagType) {
  //   const files = await this.getChangeFiles(type)
  //   for (let index = 0; index < this.packagesJSON.length; index++) {
  //     await callback(
  //       this.packagesJSON[index],
  //       index,
  //       this,
  //     )
  //   }
  // }

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
  packageJSON: IPackageJson,
  index: number,
  ctx: Context
) => Promise<any> | void
