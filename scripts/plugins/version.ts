import fs from 'fs-extra'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import { getPackagesJSON } from '../utils'
export async function cmdPackagesVersion (
  version: IPackageJson['version'],
  packagesPath: string,
) {
  const { filesPath } = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(filesPath)
  for (let i = 0; i < packagesJSON.length; i++) {
    const packageJSON = packagesJSON[i]
    packageJSON.version = version
    await fs.writeJSON(filesPath[i], packageJSON, { spaces: 2 })
  }
}
