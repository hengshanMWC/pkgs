import { execSync } from 'child_process'
import fs from 'fs-extra'
import type { IPackageJson } from '@ts-type/package-dts'
import { gitSave } from '../utils'
import type { Context } from '../index'
export async function cmdVersion (context: Context) {
  const { version: oldVersion } = await fs.readJSON('package.json')

  execSync('npx bumpp', { stdio: 'inherit' })

  const { version } = await fs.readJSON('package.json') as IPackageJson

  if (oldVersion === version) {
    console.log('canceled: The version has not changed')
    process.exit()
  }
  context.forPack(async function (packageJSON, index, context) {
    packageJSON.version = version
    await fs.writeJSON(context.filesPath[index], packageJSON, { spaces: 2 })
  })
  await gitSave(version)
}
