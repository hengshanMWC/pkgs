import { execSync } from 'child_process'
import { readFile, writeFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
import { gitSave } from '../git'
import type { Context } from '../index'
export async function cmdVersion (context: Context) {
  const { version: oldVersion } = await readFile('package.json')

  execSync('npx bumpp', { stdio: 'inherit' })

  const { version } = await readFile('package.json') as IPackageJson

  if (oldVersion === version) {
    console.log('canceled: The version has not changed')
    process.exit()
  }
  await context.forPack(async function (packageJSON, index, context) {
    packageJSON.version = version
    await writeFile(context.filesPath[index], packageJSON, { spaces: 2 })
  })
  await gitSave(version)
}
