import { execSync } from 'child_process'
import { readFile, writeFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
import { gitSave } from '../git'
import type { Context } from '../index'
export function cmdVersion (context: Context) {
  if (context.options.mode === 'sync') {
    return handleSyncVersion(context)
  }
  else if (context.options.mode === 'diff') {
    return handleDiffVersion(context)
  }
}
export async function handleSyncVersion (context: Context) {
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
export async function handleDiffVersion (context: Context) {
  const files = await context.getChangeFiles('v')
  console.log(files)
  // const { version: oldVersion } = await readFile('package.json')

  // execSync('npx bumpp', { stdio: 'inherit' })

  // const { version } = await readFile('package.json') as IPackageJson

  // if (oldVersion === version) {
  //   console.log('canceled: The version has not changed')
  //   process.exit()
  // }
  // await context.forPack(async function (packageJSON, index, context) {
  //   packageJSON.version = version
  //   await writeFile(context.filesPath[index], packageJSON, { spaces: 2 })
  // })
  // await gitSave(version)
}
