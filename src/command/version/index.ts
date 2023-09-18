import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import {
  Context,
} from '../../lib/context'
import type { CommandVersionParams, HandleMainResult, PluginData } from '../type'
import { omitDefaultParams } from '../../utils'
import { Mode, ModeOptions } from '../../constant'
import { handleDiffVersion, handleSyncVersion } from './utils'

async function commandMain (context: Context, appointVersion?: string) {
  let commandMainResult: HandleMainResult
  if (context.config.mode === Mode.DIFF) {
    commandMainResult = await handleDiffVersion(context, appointVersion)
  }
  else {
    commandMainResult = await handleSyncVersion(context, appointVersion)
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
    mode: configParam.mode,
    version: omitDefaultParams(configParam),
  })
  const context = await Context.create(
    config,
    git,
    argv,
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
    option: [
      ModeOptions,
      ['-m, --message <message>', 'commit message'],
    ],
    async action (context: Context, config: CommandVersionParams = {}) {
      context.assignOptions({
        mode: config.mode,
        version: omitDefaultParams(config),
      })
      await commandMain(context)
      await context.executeManage.execute()
    },
  }
}
