import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
import { gitDiffTag, gitSyncPublishTag } from '../git'
import { cdDir } from '../utils'
import { organization } from '../utils/regExp'
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
      analysisBlock.packageJson,
      dir,
      context.options.publish.tag,
    )
  }, 'p')
  gitDiffTag('p')
}
export async function implementPublish (
  packageJson: IPackageJson<any>,
  dir?: string,
  tag?: string,
) {
  if (!packageJson.private) {
    let command = `${cdDir(dir)}npm publish`

    if (new RegExp(organization).test(packageJson.name as string)) {
      command += ' --access public'
    }

    if (tag) {
      command += ` --tag ${tag}`
    }
    else if (packageJson.version?.includes('beta')) {
      command += ' --tag beta'
    }

    execSync(command)
  }
}
