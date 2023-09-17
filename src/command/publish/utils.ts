import { gt } from 'semver'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import type { HandleMainResult } from '../type'
import type { ExecuteTaskFunc } from '../../execute'
import { BaseExecuteTask, GitExecuteTask } from '../../execute/lib'
import { createGitTagPackageCommand, createGitTagPackageListCommand } from '../../instruct'
import { getTagPublish } from './git'

export async function handleSyncPublish (context: Context): Promise<HandleMainResult> {
  const version = await getTagPublish(context)
  const { allDirs } = context.contextAnalysisDiagram
  const analysisBlockList: AnalysisBlockItem[] = []
  const taskList: ExecuteTaskFunc[] = []
  let versionTag = ''

  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    if (!packageJson) continue
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
        analysisBlockList.push(analysisBlock)
        taskList.push(
          new BaseExecuteTask(command),
        )
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
    taskList.push(
      new GitExecuteTask(
        createGitTagPackageListCommand({
          version: versionTag,
          packageJsonList: analysisBlockList.map(item => item.packageJson),
          separator: '',
        }),
        context.fileStore.git,
      ),
    )
  }

  return {
    analysisBlockList,
    taskList,
  }
}

export async function handleDiffPublish (context: Context): Promise<HandleMainResult> {
  const triggerSign: SetAnalysisBlockObject = new Set()
  const taskList: ExecuteTaskFunc[] = []

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
      taskList.push(
        new BaseExecuteTask(command),
        new GitExecuteTask(createGitTagPackageCommand({
          packageJson: analysisBlock.packageJson,
          separator: '',
        }), context.fileStore.git),
      )
    }
  }, '')

  const analysisBlockList = [...triggerSign]

  return {
    analysisBlockList,
    taskList,
  }
}
