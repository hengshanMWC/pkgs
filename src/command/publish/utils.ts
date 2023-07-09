import { gt } from 'semver'
import type IPackageJson from '@ts-type/package-dts'
import { $ } from 'execa'
import { gitDiffSave, gitTag } from '../../utils/git'
import { cdDir, isTest } from '../../utils'
import { npmTag, organization } from '../../utils/regExp'
import type { Context, SetAnalysisBlockObject } from '../../lib'
import { getTagPublish } from './git'

export async function handleSyncPublish (context: Context) {
  const version = await getTagPublish(context)
  const { allPackagesJSON, allDirs } = context.contextAnalysisDiagram
  const commands: string[] = []
  const packageJsonList: IPackageJson[] = []
  let versionTag = ''

  for (let index = 0; index < allPackagesJSON.length; index++) {
    const packageJson = allPackagesJSON[index]
    const currentVersion = packageJson.version as string
    if (!version || gt(version, currentVersion)) {
      const command = await implementPublish(
        packageJson,
        allDirs[index],
        context.config.publish.tag,
      )
      command && packageJsonList.push(packageJson)
      command && commands.push(command)
      // 拿到最大的version当版本号
      versionTag = versionTag
        ? gt(versionTag, currentVersion)
          ? versionTag
          : currentVersion
        : currentVersion
    }
  }

  if (versionTag) {
    gitTag(versionTag, packageJsonList.map(item => item.version).join(', '))
  }

  return commands
}

export async function handleDiffPublish (context: Context) {
  const triggerSign: SetAnalysisBlockObject = new Set()
  const commands: string[] = []

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    const command = await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.config.publish.tag,
    )
    command && commands.push(command)
  }, '')

  if (commands.length) {
    await gitDiffSave(
      [...triggerSign],
      context.config.publish.message,
      '',
      context.fileStore.git,
    )
  }

  return commands
}

async function implementPublish (
  packageJson: IPackageJson<any>,
  dir?: string,
  tag?: string,
) {
  if (!packageJson.private) {
    let command = `${cdDir(dir)}pnpm publish`

    if (new RegExp(organization).test(packageJson.name as string)) {
      command += ' --access public'
    }

    if (tag !== undefined) {
      command += ` --tag ${tag}`
    }
    else if (packageJson.version) {
      const tagArr = packageJson.version.match(new RegExp(npmTag))
      if (tagArr) {
        command += ` --tag ${tagArr[1]}`
      }
    }
    if (!isTest) {
      await $`${command}`
    }
    return command
  }
}
