import { gt } from 'semver'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import type { HandleMainResult } from '../type'
import type { TaskItem } from '../../execute'
import { BaseExecuteManage, BaseExecuteTask, GitExecuteTask, SerialExecuteManage } from '../../execute/lib'
import { createGitTagPackageCommand, createGitTagPackageListCommand } from '../../instruct'
import { getTagPublish } from './git'

export async function handleSyncPublish (context: Context): Promise<HandleMainResult> {
  const version = await getTagPublish(context)
  const { allDirs } = context.contextAnalysisDiagram
  const analysisBlockList: AnalysisBlockItem[] = []
  const taskList: TaskItem[] = []
  const baseExecuteManage = new BaseExecuteManage()
  let versionTag = ''

  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    if (!packageJson) continue
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    const currentVersion = packageJson?.version as string
    if (analysisBlock && (!version || gt(version, currentVersion))) {
      const command = context.packageManager.publish(
        packageJson,
        context.ttArgv,
        {
          cwd: allDirs[index],
        },
      )
      if (command) {
        analysisBlockList.push(analysisBlock)
        // publish
        baseExecuteManage.pushTask(new BaseExecuteTask(command))
      }
      // 拿到最大的version当版本号
      versionTag = versionTag
        ? gt(versionTag, currentVersion)
          ? versionTag
          : currentVersion
        : currentVersion
    }
  }

  taskList.push(baseExecuteManage)

  if (versionTag) {
    const serialExecuteManage = new SerialExecuteManage()
    // 串行
    serialExecuteManage.pushTask(
      ...taskList,
      // tag
      new GitExecuteTask(
        createGitTagPackageListCommand({
          version: versionTag,
          packageJsonList: analysisBlockList.map(item => item.packageJson),
          separator: '',
        }),
        context.fileStore.git,
      ),
    )
    taskList.length = 0
    taskList.push(serialExecuteManage)
  }

  return {
    analysisBlockList,
    taskList,
  }
}

export async function handleDiffPublish (context: Context): Promise<HandleMainResult> {
  const triggerSign: SetAnalysisBlockObject = new Set()
  const taskList: TaskItem[] = []

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    const command = context.packageManager.publish(
      analysisBlock.packageJson,
      context.ttArgv,
      {
        cwd: analysisBlock.dir,
      },
    )
    if (command) {
      triggerSign.add(analysisBlock)
      taskList.push(
        // 串行
        new SerialExecuteManage().pushTask(
          // publish
          new BaseExecuteTask(command),
          // tag
          new GitExecuteTask(createGitTagPackageCommand({
            packageJson: analysisBlock.packageJson,
            separator: '',
          }), context.fileStore.git),
        ),
      )
    }
  }, '')

  const analysisBlockList = [...triggerSign]

  return {
    analysisBlockList,
    taskList,
  }
}
