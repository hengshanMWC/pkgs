import colors from 'colors'
import { versionBumpInfo } from '@abmao/bump'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import { gitCommitMessageFormat, isTest, warn } from '../../utils'
import { getCommitPackageListMessage } from '../../utils/git'
import { WARN_NOW_VERSION } from '../../constant'
import { dependentSearch, gtPackageJsonToDir } from '../../utils/packageJson'
import type { TaskItem } from '../../execute'
import { JsonExecuteTask, GitExecuteTask, SerialExecuteManage, BaseExecuteManage } from '../../execute'
import {
  createGitAddCommand,
  createGitCommitCommand,
  createGitTagPackageCommand,
  createGitTagPackageListCommand,
} from '../../instruct'
import { getTagVersion } from './git'

export async function handleSyncVersion (context: Context, appointVersion?: string) {
  const version = await getChangeVersion(context, appointVersion)
  const analysisBlockList: AnalysisBlockItem[] = []
  const taskList: TaskItem[] = []

  // 依赖更新
  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    if (!packageJson) break
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    packageJson.version = version

    if (analysisBlock) {
      analysisBlockList.push(analysisBlock)
      await changeRelyMyVersion(context, analysisBlock)
      taskList.push(new JsonExecuteTask({
        args: analysisBlock,
      }))
    }
  }
  if (taskList.length && appointVersion) {
    const executeManage = new SerialExecuteManage()
    executeManage.pushTask(
      new GitExecuteTask(
        createGitAddCommand(analysisBlockList.map(item => item.filePath)),
        context.fileStore.git,
      ),
      new GitExecuteTask(
        createGitCommitCommand(gitCommitMessageFormat(context.config.version.message, `v${version}`)),
        context.fileStore.git,
      ),
      new GitExecuteTask(createGitTagPackageListCommand({
        version: appointVersion,
        packageJsonList: analysisBlockList.map(item => item.packageJson),
        separator: 'v',
      }), context.fileStore.git),
    )
    taskList.push(executeManage)
  }
  return {
    analysisBlockList,
    taskList,
  }
}

export async function handleDiffVersion (context: Context, appointVersion?: string) {
  const triggerSign: SetAnalysisBlockObject = new Set()

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    await changeVersionResultItem(
      context,
      analysisBlock,
      analysisBlock.dir,
      triggerSign,
      appointVersion,
    )
  })

  const analysisBlockList = [...triggerSign]
  const taskList: TaskItem[] = []

  if (analysisBlockList.length) {
    const packageJsonManage = new BaseExecuteManage()
    const packageJsonCommand = analysisBlockList.map(analysisBlock => {
      return new JsonExecuteTask({
        args: analysisBlock,
      })
    })
    packageJsonManage.pushTask(...packageJsonCommand)

    const gitFileManage = new SerialExecuteManage()
    gitFileManage.pushTask(
      new GitExecuteTask(
        createGitAddCommand(analysisBlockList.map(item => item.filePath)),
        context.fileStore.git,
      ),
      new GitExecuteTask(
        createGitCommitCommand(
          getCommitPackageListMessage(
            analysisBlockList.map(analysisBlock => analysisBlock.packageJson),
            'v',
            context.config.version.message,
          ),
        ),
        context.fileStore.git,
      ),
    )

    const gitTagManage = new BaseExecuteManage()
    const gitTagCommand = analysisBlockList.map(analysisBlock => {
      return new GitExecuteTask(createGitTagPackageCommand({
        packageJson: analysisBlock.packageJson,
        separator: 'v',
      }), context.fileStore.git)
    })
    gitTagManage.pushTask(...gitTagCommand)

    const taskManage = new SerialExecuteManage()

    taskManage.pushTask(packageJsonManage, gitFileManage, gitTagManage)

    taskList.push(taskManage)
  }
  // await writeJSONs(triggerSign)
  // await context.fileStore.git.add(analysisBlockList.map(item => item.filePath))
  // await gitDiffSave(
  //   analysisBlockList.map(item => item.packageJson),
  //   context.config.version.message,
  //   'v',
  //   context.fileStore.git,
  // )
  return {
    analysisBlockList,
    taskList,
  }
}

// 获取仓库最新版本对应的包路径
async function versionTagToDir (context: Context) {
  const version = await getTagVersion(context, 'v')
  if (version) {
    const index = context.contextAnalysisDiagram.allPackagesJSON
      .findIndex(packageJson => packageJson?.version === version)
    if (index !== -1) {
      return context.contextAnalysisDiagram.allDirs[index]
    }
  }
}

// 获取包里面版本最高的包路径
function getVersionMax (context: Context) {
  return context.contextAnalysisDiagram.allDirs.reduce((a, b) => {
    const aPackageJson = context.contextAnalysisDiagram.dirToAnalysisDiagram(a)?.packageJson
    const bPackageJson = context.contextAnalysisDiagram.dirToAnalysisDiagram(b)?.packageJson
    return gtPackageJsonToDir(a, b, aPackageJson, bPackageJson)
  })
}

// 获取包路径用于做版本升级依据
async function getSyncTargetVersionDir (context: Context) {
  const dir = await versionTagToDir(context)
  if (dir) {
    return dir
  }
  return getVersionMax(context)
}
async function getChangeVersion (context: Context, appointVersion?: string) {
  const dir = await getSyncTargetVersionDir(context)
  const analysisBlock = context.contextAnalysisDiagram.dirToAnalysisDiagram(dir)
  const oldVersion = analysisBlock?.packageJson?.version
  const version = await changeVersion(dir, appointVersion)

  if (oldVersion === version) {
    if (isTest) {
      throw new Error(WARN_NOW_VERSION)
    }
    else {
      warn(WARN_NOW_VERSION)
      process.exit()
    }
  }
  return version
}

// 升级包
async function changeVersionResultItem (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  dir: string,
  triggerSign: SetAnalysisBlockObject,
  appointVersion?: string,
) {
  const { packageJson } = analysisBlock

  if (triggerSign.has(analysisBlock)) return
  triggerSign.add(analysisBlock)

  const oldVersion = packageJson.version
  console.log(colors.white.bold(`package: ${packageJson.name}`))
  const version = await changeVersion(dir, appointVersion)

  if (version !== oldVersion) {
    packageJson.version = version
    await changeRelyMyVersion(context, analysisBlock, triggerSign, appointVersion)
  }
}

// 用来升级依赖当前包的包
async function changeRelyMyVersion (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  triggerSign?: SetAnalysisBlockObject,
  appointVersion?: string,
) {
  const relyMyDir = analysisBlock.relyMyDir
  // 没有任务依赖当前包则跳出去
  if (!Array.isArray(relyMyDir)) return

  for (let i = 0; i < relyMyDir.length; i++) {
    const relyDir = relyMyDir[i]
    const analysisBlockRelyMy = context.contextAnalysisDiagram.dirToAnalysisDiagram(relyDir)
    if (analysisBlockRelyMy) {
      const isChange = dependentSearch(analysisBlock, analysisBlockRelyMy)

      // 只有有变更，并且带triggerSign，才会走version变动
      if (isChange && triggerSign && !triggerSign.has(analysisBlockRelyMy)) {
        await changeVersionResultItem(
          context,
          analysisBlockRelyMy,
          relyDir,
          triggerSign,
          appointVersion,
        )
      }
    }
  }
}

async function changeVersion (cwd?: string, release?: string) {
  const versionBumpResults = await versionBumpInfo({
    release,
    cwd,
  })

  return versionBumpResults.newVersion
}
