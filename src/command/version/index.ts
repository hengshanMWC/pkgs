import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import {
  Context,
} from '../../lib/context'
import type { CommandVersionParams, HandleMainResult, PluginData } from '../type'
import { Mode, ModeOptions, NoPushOptions, PushOptions } from '../../constant'
import { getConfigValue } from '../../utils'
import { BaseExecuteManage, GitExecuteTask, SerialExecuteManage } from '../../execute'
import { createGitPushCommand } from '../../instruct'
import { getGitRemoteList } from '../../utils/git'
import { handleDiffVersion, handleSyncVersion } from './utils'

async function commandMain (context: Context, appointVersion?: string) {
  let commandMainResult: HandleMainResult
  if (getConfigValue(context.config, 'version', 'mode') === Mode.DIFF) {
    commandMainResult = await handleDiffVersion(context, appointVersion)
  }
  else {
    commandMainResult = await handleSyncVersion(context, appointVersion)
  }

  if (getConfigValue(context.config, 'version', 'push')) {
    // 拿到remote数组
    const remoteList = await getGitRemoteList(context.fileStore.git)
    if (remoteList.length) {
      const serialExecuteManage = new SerialExecuteManage()
      const baseExecuteManage = new BaseExecuteManage()
      baseExecuteManage.pushTask(...commandMainResult.taskList)
      // 串行
      serialExecuteManage.pushTask(
        baseExecuteManage,
        // 提交所有远程源
        ...remoteList.map(remote => {
          return new GitExecuteTask(
            createGitPushCommand([remote, 'HEAD', '--follow-tags', '--no-verify', '--atomic']),
            context.fileStore.git,
          )
        }),
      )
      commandMainResult.taskList = [serialExecuteManage]
    }
  }

  context.executeManage.enterMainResult(commandMainResult)
  return context
}

export async function parseCommandVersion (
  configParam: CommandVersionParams = {},
  git: SimpleGit = simpleGit(),
  appointVersion?: string,
  argv?: string[],
) {
  const config = await Context.assignConfig({
    version: configParam,
  })
  const context = await Context.create(
    {
      config,
      git,
      argv,
    },
  )
  return commandMain(context, appointVersion)
}

export async function commandVersion (
  configParam: CommandVersionParams = {},
  git: SimpleGit = simpleGit(),
  appointVersion?: string,
  argv?: string[],
) {
  const context = await parseCommandVersion(configParam, git, appointVersion, argv)
  const executeCommandResult = await context.executeManage.execute()
  return {
    analysisBlockList: context.executeManage.getCommandData().analysisBlockList,
    executeResult: executeCommandResult,
  }
}

export function createVersionPlugin (): PluginData {
  return {
    id: 'version',
    command: 'version',
    description: 'version package',
    options: [
      ModeOptions,
      ['-m, --message <message>', 'commit message'],
      PushOptions,
      NoPushOptions,
    ],
    allowUnknownOption: true,
    async action (context: Context, config: CommandVersionParams = {}) {
      context.assignOptions({
        version: config,
      })
      await commandMain(context)
      await context.executeManage.execute()
    },
  }
}
