import type { IPackageJson } from '@ts-type/package-dts'
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
  packageJSON: IPackageJson,
  relyMyMp: Record<string, string[]>,
) {
  const dependencies = getRely(packageJSON)
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
export function getMyRelyPackageName (
  packagesName: string[],
  packageJSON: IPackageJson,
) {
  const result: string[] = []
  const dependencies = getRely(packageJSON)
  packagesName.forEach(key => {
    const dependenciesValue = dependencies[key]
    if (dependenciesValue && !dependenciesValue.includes('workspace:*')) {
      result.push(key)
    }
  })
  return result
}
export function getRely (packageJSON: IPackageJson) {
  const result: IPackageJson['dependencies'] = {}
  const relyAttrs = getRelyAttrs()
  relyAttrs.forEach(attr => Object.assign(result, packageJSON[attr]))
  return result
}
export function getRelyAttrs () {
  return [
    'bundleDependencies',
    'bundledDependencies',
    'optionalDependencies',
    'peerDependencies',
    'devDependencies',
    'dependencies',
  ]
}
