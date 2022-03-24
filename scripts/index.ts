import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import simpleGit from 'simple-git'
import { getPackagesJSON } from './utils'
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
    const packagesName = this.getPackagesName(packagesJSON)
    const relyMyMap = this.createRelyMyMap(packagesName)
    this.contextAnalysisDiagram = {}
    dirs.forEach((dir, index) => {
      const packageJSON = packagesJSON[index]
      this.setRelyMyhMap(dir, packageJSON, relyMyMap)
      this.contextAnalysisDiagram[dir] = {
        packageJSON,
        filePath: filesPath[index],
        relyMy: relyMyMap[packageJSON.name as string],
        myRely: this.getMyRely(packagesName, packageJSON),
      }
    })
  }

  getPackagesName (packagesJSON: IPackageJson[]): string[] {
    return packagesJSON
      .map(item => item.name)
      .filter(item => item !== undefined) as string []
  }

  createRelyMyMap (packagesName: string[]) {
    const result: Record<string, string[]> = {}
    packagesName.forEach(item => {
      result[item] = []
    })
    return result
  }

  setRelyMyhMap (
    dir: string,
    packageJSON: IPackageJson,
    relyMyMp: Record<string, string[]>,
  ) {
    const dependencies = this.getRely(packageJSON)
    if (!Object.keys(dependencies).length) {
      // 没有依赖直接跳过
      return
    }
    Object.keys(relyMyMp)
      .forEach(key => {
        const dependenciesValue = dependencies[key]
        if (dependenciesValue && !dependenciesValue.includes('workspace:*')) {
          relyMyMp[key].push(dir)
        }
      })
  }

  getMyRely (packagesName: string[], packageJSON: IPackageJson) {
    const result: string[] = []
    const dependencies = this.getRely(packageJSON)
    packagesName.forEach(key => {
      const dependenciesValue = dependencies[key]
      if (dependenciesValue && !dependenciesValue.includes('workspace:*')) {
        result.push(key)
      }
    })
    return result
  }

  getRely (packageJSON: IPackageJson) {
    return {
      ...packageJSON.devDependencies,
      ...packageJSON.dependencies,
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
