import { execSync } from 'child_process'
import { getPackagesDir } from '@abmao/forb'
import fs from 'fs-extra'
import type { IPackageJson } from '@ts-type/package-dts'
export function gitSave (version: IPackageJson['version']) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m 'chore: release v${version}'`, { stdio: 'inherit' })
  execSync(`git tag -a v${version} -m 'v${version}'`, { stdio: 'inherit' })
}
export async function getPackagesJSON (dirs: string[]) {
  const result: IPackageJson[] = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await fs.readJSON(dirs[i]))
  }

  return result
}
export type ForPackCallback = (
  packageJSON: IPackageJson,
  dirs: string,
  filesPath: string
) => Promise<any>
export async function forPack (
  callback: ForPackCallback,
  packagesPath: string,
) {
  const { dirs, filesPath } = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(filesPath)
  for (let i = 0; i < packagesJSON.length; i++) {
    await callback(packagesJSON[i], dirs[i], filesPath[i])
  }
}
