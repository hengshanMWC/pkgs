import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
import { gitDiffTag } from '../git'
import { fixCWD } from '../utils'
export function cmdPublish (context: Context) {
  if (context.options.mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (context.options.mode === 'diff') {
    return handleDiffPublish(context)
  }
}
export async function handleSyncPublish (context: Context) {
  for (let index = 0; index < context.allPackagesJSON.length; index++) {
    await implementPublish(
      context.allPackagesJSON[index],
      context.allDirs[index],
    )
  }
  gitDiffTag('p')
}
export async function handleDiffPublish (context: Context) {
  await context.forDiffPack(async function (analysisBlock, dir) {
    await implementPublish(analysisBlock.packageJSON, dir)
  }, 'p')
  gitDiffTag('p')
}
export async function implementPublish (
  packageJSON: IPackageJson<any>,
  cwd?: string,
) {
  if (!packageJSON.private) {
    let command = 'npm publish --access public'
    if (packageJSON.version?.includes('beta')) { command += ' --tag beta' }
    execSync(command, {
      stdio: 'inherit',
      cwd: fixCWD(cwd),
    })
  }
}
