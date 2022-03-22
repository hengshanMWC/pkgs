import { execSync } from 'child_process'
import { readFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
export function gitSave (version: IPackageJson['version']) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m 'chore: release v${version}'`, { stdio: 'inherit' })
  execSync(`git tag -a v${version} -m 'v${version}'`, { stdio: 'inherit' })
}
export async function getPackagesJSON (dirs: string[]) {
  const result: IPackageJson[] = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await readFile(dirs[i]))
  }

  return result
}
