import type { IPackageJson } from '@ts-type/package-dts'
import type { AnalysisBlockItem } from '../analysisDiagram'
import { getRelyAttrs } from './analysisDiagram'
import { versionText, versionRangeText } from './regExp'
import { isVersionStar } from './index'

export function dependentSearch (
  source: AnalysisBlockItem,
  analysisBlockRelyMy: AnalysisBlockItem,
) {
  let result = false
  const sourcePackageJson = source.packageJson
  const {
    name: sourceName,
    version: sourceVersion,
  } = sourcePackageJson

  if (sourceName && sourceVersion) {
    const packageJson = analysisBlockRelyMy.packageJson
    const relyAttrs = getRelyAttrs().reverse()
    // 循环所有依赖key
    relyAttrs.forEach(key => {
      const relyKeyObject = packageJson[key]
      if (!relyKeyObject) return
      const oldVersion = relyKeyObject[sourceName]

      if (oldVersion) {
        const isChange = isVersionLegalUpdate(
          sourceVersion,
          oldVersion,
        )
        if (isChange && !result) {
          // 证明更新过
          result = true
        }
        if (isChange) {
          dependencyUpdate(
            packageJson,
            key,
            sourceName,
            sourceVersion,
          )
        }
      }
    })
  }
  return result
}
// TODO: 只有packageJsonVersion是预发布版本才会被version预发布版本更新
function isVersionLegalUpdate (
  version: string,
  oldVersion: string,
) {
  // *每次都会更新
  if (isVersionStar(oldVersion)) return true

  const versionRangTextRegExp = new RegExp(versionRangeText)
  const versionMatchArray = version.match(versionRangTextRegExp)
  const oldVersionMatchArray = oldVersion.match(versionRangTextRegExp)

  if (versionMatchArray && oldVersionMatchArray) {
    const minor = (+versionMatchArray[3] > +oldVersionMatchArray[3])
    const major = (+versionMatchArray[2] > +oldVersionMatchArray[2])
    if (oldVersionMatchArray[1] === '~') {
      return minor || major
    }
    else if (oldVersionMatchArray[1] === '^') {
      return major
    }
  }
  return false
}
function dependencyUpdate (
  packageJson: IPackageJson,
  relyAttr: string,
  name: string,
  version: string,
) {
  const oldVersion = packageJson[relyAttr][name]

  if (isVersionStar(oldVersion)) return

  const versionRegExp = new RegExp(versionText)
  packageJson[relyAttr][name] =
        packageJson[relyAttr][name]
          .replace(versionRegExp, version)
}
