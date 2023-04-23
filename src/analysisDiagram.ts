import type IPackageJson from '@ts-type/package-dts'
import { readJSON } from 'fs-extra'
import { getPackagesDir } from '@abmao/forb'
import { getJSONs } from './utils'
import { createRelyMyDirMap, getMyRelyPackageName, getPackagesName, setRelyMyDirhMap } from './utils/analysisDiagram'
import type { ExecuteCommandOptions } from './defaultOptions'

export {
  ContextAnalysisDiagram,
  AnalysisBlockItem,
  AnalysisDiagram,
}

interface AnalysisBlockItem {
  packageJson: IPackageJson
  filePath: string
  dir: string
  relyMyDir: string[]
  myRelyDir: string[]
}
type AnalysisDiagram = Record<string, AnalysisBlockItem>
class ContextAnalysisDiagram {
  packagesPath: ExecuteCommandOptions['packagesPath']
  analysisDiagram!: AnalysisDiagram
  rootPackageJson!: IPackageJson
  rootFilePath = 'package.json'
  rootDir = ''
  constructor (packagesPath: ExecuteCommandOptions['packagesPath']) {
    this.packagesPath = packagesPath
  }

  async initData () {
    this.rootPackageJson = await readJSON(this.rootFilePath)
    const values: [string[], string[], IPackageJson[]] = [
      [this.rootDir],
      [this.rootFilePath],
      [this.rootPackageJson],
    ]

    if (this.packagesPath) {
      try {
        const { dirs, filesPath } = await getPackagesDir(
          this.packagesPath,
        )
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
    this.analysisDiagram = {}

    dirs.forEach((dir, index) => {
      const packageJson = packagesJSON[index]
      setRelyMyDirhMap(dir, packageJson, relyMyMap)
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
}
