import type { IPackageJson } from '@ts-type/package-dts'
import { satisfies } from 'semver'
import type { AnalysisBlockItem } from '../lib/analysisDiagram'
import { getRelyAttrs } from './analysisDiagram'
import { versionText } from './regExp'
import { getWorkspaceVersion, isVersionStar } from './index'

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
  // *、~、^每次都会更新
  return isVersionStar(oldVersion) ||
    satisfies(version, getWorkspaceVersion(oldVersion))
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

export function getPackageNameVersion (packageJson: IPackageJson, separator = '') {
  return `${packageJson.name}@${separator}${packageJson.version}`
}

export function getPackageNameVersionList (packageJsonList: IPackageJson[], separator = '') {
  return packageJsonList.map(packageJson => getPackageNameVersion(packageJson, separator))
}

export function getPackageNameVersionStr (packageJsonList: IPackageJson[], separator = '') {
  return getPackageNameVersionList(packageJsonList, separator).join(', ')
}
