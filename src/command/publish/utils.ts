import { gt } from 'semver'
import { gitDiffSave, gitTag } from '../../utils/git'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import type { CommandResult } from '../type'
import { getTagPublish } from './git'

export async function handleSyncPublish (context: Context) {
  const version = await getTagPublish(context)
  const { allDirs } = context.contextAnalysisDiagram
  const analysisBlockList: AnalysisBlockItem[] = []
  const commandList: CommandResult[] = []
  let versionTag = ''

  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    const currentVersion = packageJson?.version as string
    if (analysisBlock && (!version || gt(version, currentVersion))) {
      const command = await context.packageManager.publish(
        packageJson,
        context.argvValue,
        {
          cwd: allDirs[index],
        },
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
  const commandList: CommandResult[] = []

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    const command = await context.packageManager.publish(
      analysisBlock.packageJson,
      context.argvValue,
      {
        cwd: analysisBlock.dir,
      },

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
