import { readFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
export async function getPackagesJSON (dirs: string[]) {
  const result: IPackageJson[] = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await readFile(dirs[i]))
  }

  return result
}
export function cdDir (dir?: string) {
  return dir ? `cd ${dir} && ` : ''
}
