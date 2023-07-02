import type IPackageJson from '@ts-type/package-dts'
import { getDirPackageInfo, getJSONs, sortFilesName } from '../utils'
import {
  createRelyMyDirMap,
  getMyRelyPackageName,
  getPackagesName,
  getRelyAttrs,
  setRelyMyDirMap,
} from '../utils/analysisDiagram'
import type { ExecuteCommandConfig } from '../defaultOptions'

export { ContextAnalysisDiagram, AnalysisBlockItem, AnalysisDiagram, SetAnalysisBlockObject }

interface AnalysisBlockItem {
  packageJson: IPackageJson
  filePath: string
  dir: string
  relyMyDir: string[]
  myRelyDir: string[]
}
type AnalysisDiagram = Record<string, AnalysisBlockItem>
type SetAnalysisBlockObject = Set<AnalysisBlockItem>
class ContextAnalysisDiagram {
  packagesPath: ExecuteCommandConfig['packagesPath']
  analysisDiagram!: AnalysisDiagram

  constructor (packagesPath: ExecuteCommandConfig['packagesPath']) {
    this.packagesPath = packagesPath
  }

  // 获取所有包目录路径
  get allDirs () {
    if (this.analysisDiagram) {
      return sortFilesName(Object.keys(this.analysisDiagram))
    }
    else {
      return []
    }
  }

  // 获取所有包package.json文件路径
  get allFilesPath () {
    if (this.analysisDiagram) {
      return this.allDirs.map(
        key => this.analysisDiagram[key].filePath,
      )
    }
    else {
      return []
    }
  }

  // 获取所有包的package.json
  get allPackagesJSON () {
    if (this.analysisDiagram) {
      return this.allDirs.map(
        key => this.analysisDiagram[key].packageJson,
      )
    }
    else {
      return []
    }
  }

  async initData () {
    // 根目录信息
    const values: [string[], string[], IPackageJson[]] = [
      [],
      [],
      [],
    ]

    // 子包目录信息
    if (this.packagesPath) {
      try {
        const { dirs, filesPath } = await getDirPackageInfo(this.packagesPath)
        const packagesJSON = await getJSONs(filesPath)
        values[0].push(...dirs)
        values[1].push(...filesPath)
        values[2].push(...packagesJSON)
      }
      catch (error) {
        console.error('获取子包信息错误: ', error)
      }
    }

    this.createContextAnalysisDiagram(...values)
  }

  async getRelatedDir (
    forCD: (cd: (source: AnalysisBlockItem) => void) => Promise<void>,
  ) {
    const triggerSign: SetAnalysisBlockObject = new Set()
    await forCD(source => {
      this.getRelatedContent(source, triggerSign)
    })
    return [...triggerSign].map(item => item.dir)
  }

  getRelatedPackagesDir (files: string[] | boolean | undefined) {
    if (Array.isArray(files)) {
      return this.allDirs.filter(key => files.some(file => file.includes(key)))
    }
    else {
      return []
    }
  }

  // 拓扑排序
  getDirTopologicalSorting (dirs: string[]) {
    const result: string[] = []
    const stack: string[] = []

    this.dependencyTracking(dirs, result, stack, function () {
      const value = stack[stack.length - 1]
      if (value !== undefined && !result.includes(value)) {
        result.push(value)
      }
      stack.pop()
    })
    return result
  }

  packageJsonToAnalysisBlock (packageJson: IPackageJson) {
    for (const key in this.analysisDiagram) {
      const analysisBlock = this.analysisDiagram[key]

      if (analysisBlock.packageJson === packageJson) {
        return analysisBlock
      }
    }
  }

  private createContextAnalysisDiagram (
    dirs: string[],
    filesPath: string[],
    packagesJSON: IPackageJson[],
  ) {
    const packagesName = getPackagesName(packagesJSON)
    const relyMyMap = createRelyMyDirMap(packagesName)
    this.analysisDiagram = {}

    // 组装依赖，生成图表信息
    dirs.forEach((dir, index) => {
      const packageJson = packagesJSON[index]
      setRelyMyDirMap(dir, packageJson, relyMyMap)
      const names = getMyRelyPackageName(packagesName, packageJson)
      const myRelyDir = names.map(name => {
        const i = packagesJSON.findIndex(item => item.name === name)
        return dirs[i]
      })

      this.analysisDiagram[dir] = {
        packageJson,
        dir,
        filePath: filesPath[index],
        relyMyDir: relyMyMap[packageJson.name as string],
        myRelyDir,
      }
    })
  }

  private getRelatedContent (source: AnalysisBlockItem, triggerSign: SetAnalysisBlockObject) {
    if (triggerSign.has(source)) return
    triggerSign.add(source)
    const relyMyDir = source.relyMyDir

    // 没有依赖则跳出去
    if (!Array.isArray(source.relyMyDir)) return
    const relyAttrs = getRelyAttrs().reverse()

    for (let i = 0; i < relyMyDir.length; i++) {
      const relyDir = relyMyDir[i]
      const analysisBlock = this.analysisDiagram[relyDir]
      if (triggerSign.has(analysisBlock)) continue

      for (let j = 0; j < relyAttrs.length; j++) {
        const key = relyAttrs[i]
        const relyKeyObject = analysisBlock.packageJson[key]
        if (!relyKeyObject) return
        this.getRelatedContent(analysisBlock, triggerSign)
      }
    }
  }

  private dependencyTracking (
    dirs: string[],
    result: string[],
    stack: string[],
    cd: Function,
  ) {
    dirs.forEach(dir => {
      if (stack.includes(dir) || result.includes(dir)) return
      stack.push(dir)

      const { myRelyDir } = this.analysisDiagram[dir]
      myRelyDir.forEach(item => {
        if (!stack.includes(item)) {
          stack.push(item)
          const { myRelyDir } = this.analysisDiagram[item]
          this.dependencyTracking(myRelyDir, result, stack, cd)
          cd()
        }
      })
      cd()
    })
  }
}
