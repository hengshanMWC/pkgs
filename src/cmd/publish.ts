import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
import { gitDiffTag, gitSyncPublishTag } from '../git'
import { cdDir } from '../utils'
import testGlobal from '../utils/test'
import { organization, npmTag } from '../utils/regExp'
export function cmdPublish (context: Context) {
  const mode = context.getCorrectOptionValue('publish', 'mode')

  if (mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (mode === 'diff') {
    return handleDiffPublish(context)
  }
}
async function handleSyncPublish (context: Context) {
  for (let index = 0; index < context.allPackagesJSON.length; index++) {
    await implementPublish(
      context.allPackagesJSON[index],
      context.allDirs[index],
      context.options.publish.tag,
    )
  }
  gitSyncPublishTag(undefined, context.git)
}
async function handleDiffPublish (context: Context) {
  await context.forRepositoryDiffPack(async function (analysisBlock) {
    await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.options.publish.tag,
    )
  }, 'publish')
  gitDiffTag('publish', undefined, context.git)
}
async function implementPublish (
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
    else if (packageJson.version) {
      const tagArr = packageJson.version.match(new RegExp(npmTag))
      if (tagArr) {
        command += ` --tag ${tagArr[1]}`
      }
    }
    if (process.env.NODE_ENV === 'test') {
      if (testGlobal.pkgsTestPublish) {
        testGlobal.pkgsTestPublish(command)
      }
    }
    else {
      execSync(command)
    }
  }
}
