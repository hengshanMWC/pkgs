import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
import { gitDiffTag, gitSyncPublishTag } from '../git'
import { cdDir } from '../utils'
export function cmdPublish (context: Context) {
  const mode = context.getCorrectOptionValue<'mode'>('publish', 'mode')
  if (mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (mode === 'diff') {
    return handleDiffPublish(context)
  }
}
export async function handleSyncPublish (context: Context) {
  for (let index = 0; index < context.allPackagesJSON.length; index++) {
    await implementPublish(
      context.allPackagesJSON[index],
      context.allDirs[index],
      context.options.publish.tag,
    )
  }
  gitSyncPublishTag()
}
export async function handleDiffPublish (context: Context) {
  await context.forDiffPack(async function (analysisBlock, dir) {
    await implementPublish(
      analysisBlock.packageJSON,
      dir,
      context.options.publish.tag,
    )
  }, 'p')
  gitDiffTag('p')
}
export async function implementPublish (
  packageJSON: IPackageJson<any>,
  dir?: string,
  tag?: string,
) {
  if (!packageJSON.private) {
    let command = `${cdDir(dir)}npm publish --access public`
    if (tag) {
      command += ` --tag ${tag}`
    }
    else if (packageJSON.version?.includes('beta')) {
      command += ' --tag beta'
    }
    execSync(command)
  }
}
