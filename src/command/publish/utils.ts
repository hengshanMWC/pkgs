import { gt } from 'semver'
import type IPackageJson from '@ts-type/package-dts'
import { $ } from 'execa'
import { gitDiffSave, gitTag } from '../../utils/git'
import { cdDir, isTest } from '../../utils'
import { npmTag, organization } from '../../utils/regExp'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import { getTagPublish } from './git'

export async function handleSyncPublish (context: Context) {
  const version = await getTagPublish(context)
  const { allDirs } = context.contextAnalysisDiagram
  const analysisBlockList: AnalysisBlockItem[] = []
  const commandList: string[] = []
  let versionTag = ''

  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    const currentVersion = packageJson?.version as string
    if (analysisBlock && (!version || gt(version, currentVersion))) {
      const command = await implementPublish(
        packageJson,
        allDirs[index],
        context.config.publish.tag,
      )
      if (command) {
        commandList.push(command)
        analysisBlockList.push(analysisBlock)
      }
      // 拿到最大的version当版本号
      versionTag = versionTag
        ? gt(versionTag, currentVersion)
          ? versionTag
          : currentVersion
        : currentVersion
    }
  }

  if (versionTag) {
    await gitTag(versionTag, analysisBlockList.map(item => item.packageJson.version).join(', '))
  }

  return {
    analysisBlockList,
    commandList,
  }
}

export async function handleDiffPublish (context: Context) {
  const triggerSign: SetAnalysisBlockObject = new Set()
  const commandList: string[] = []

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    const command = await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.config.publish.tag,
    )
    if (command) {
      triggerSign.add(analysisBlock)
      commandList.push(command)
    }
  }, '')

  const analysisBlockList = [...triggerSign]

  if (analysisBlockList.length) {
    await gitDiffSave(
      analysisBlockList.map(item => item.packageJson),
      context.config.publish.message,
      '',
      context.fileStore.git,
    )
  }

  return {
    analysisBlockList,
    commandList,
  }
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
      await $({ stdio: 'inherit' })`${'npm publish'}`
    }
    return command
  }
}
