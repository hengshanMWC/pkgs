import type { IPackageJson } from '@ts-type/package-dts'
import { RELY_KEYS } from '../constant'
export function getPackagesName (packagesJSON: IPackageJson[]): string[] {
  return packagesJSON
    .map(item => item.name)
    .filter(item => item !== undefined) as string []
}
export function createRelyMyDirMap (packagesName: string[]) {
  const result: Record<string, string[]> = {}
  packagesName.forEach(item => {
    result[item] = []
  })
  return result
}
export function setRelyMyDirhMap (
  dir: string,
  packageJson: IPackageJson,
  relyMyMp: Record<string, string[]>,
) {
  const dependencies = getRely(packageJson)

  if (!Object.keys(dependencies).length) {
    // 没有依赖直接跳过
    return
  }

  Object.keys(relyMyMp)
    .forEach(key => {
      const dependenciesValue = dependencies[key]

      if (dependenciesValue) {
        relyMyMp[key].push(dir)
      }
    })
}
export function getMyRelyPackageName (
  packagesName: string[],
  packageJson: IPackageJson,
) {
  const result: string[] = []
  const dependencies = getRely(packageJson)

  packagesName.forEach(key => {
    const dependenciesValue = dependencies[key]

    if (dependenciesValue) {
      result.push(key)
    }
  })
  return result
}
export function getRely (packageJson: IPackageJson) {
  const result: IPackageJson['dependencies'] = {}
  const relyAttrs = getRelyAttrs()

  relyAttrs.forEach(attr => Object.assign(result, packageJson[attr]))

  return result
}
export function getRelyAttrs () {
  return RELY_KEYS.slice()
}
