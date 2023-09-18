import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import { Context } from '../../lib/context'
import type { CommandPublishParams, HandleMainResult, PluginData } from '../type'
import { getConfigValue } from '../../utils'
import { Mode, ModeOptions } from '../../constant'
import { handleDiffPublish, handleSyncPublish } from './utils'

async function commandMain (context: Context) {
  let commandMainResult: HandleMainResult
  if (getConfigValue(context.config, 'publish', 'mode') === Mode.DIFF) {
    commandMainResult = await handleDiffPublish(context)
  }
  else {
    commandMainResult = await handleSyncPublish(context)
  }
  context.executeManage.enterMainResult(commandMainResult)
  return context
}

export async function parseCommandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    publish: configParam,
  })
  const context = await Context.create(
    {
      config,
      git,
      argv,
    },
  )
  return commandMain(context)
}

export async function commandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const context = await parseCommandPublish(configParam, git, argv)
  const executeCommandResult = await context.executeManage.execute()
  return {
    analysisBlockList: context.executeManage.getCommandData().analysisBlockList,
    executeResult: executeCommandResult,
  }
}

export function createPublishPlugin (): PluginData {
  return {
    id: 'publish',
    command: 'publish',
    description: 'publish package',
    option: [
      ModeOptions,
    ],
    async action (context: Context, params: CommandPublishParams = {}) {
      context.assignOptions({
        mode: params.mode,
        publish: params,
      })
      await commandMain(context)
      await context.executeManage.execute()
    },
  }
}
