import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandMainResult, CommandPublishParams, ExecuteCommandResult, PluginData } from '../type'
import { handleDiffPublish, handleSyncPublish } from './utils'

async function commandMain (context: Context) {
  let commandMainResult: CommandMainResult
  // TODO 是否使用config.publish.mode
  if (context.config.mode === 'diff') {
    commandMainResult = await handleDiffPublish(context)
  }
  else {
    commandMainResult = await handleSyncPublish(context)
  }
  return context.enterCommandResult(commandMainResult)
}

export async function parseCommandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    publish: getPublishConfig(configParam),
  })
  const context = await Context.create(
    config,
    git,
    argv,
  )
  return commandMain(context)
}

export async function commandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
): Promise<ExecuteCommandResult> {
  const context = await parseCommandPublish(configParam, git, argv)
  const executeCommandResult = await context.execute.outRun()
  return {
    ...context.getCommandResult(),
    executeResult: executeCommandResult,
  }
}

export function createPublishPlugin (): PluginData {
  return {
    id: 'publish',
    command: 'publish',
    description: 'publish package',
    option: [
      ['-message <message>', 'npm publish --message <message>'],
    ],
    async action (context: Context, params: CommandPublishParams = {}) {
      context.assignOptions({
        mode: params.mode,
        publish: getPublishConfig(params),
      })
      await commandMain(context)
      await context.execute.outRun()
    },
  }
}

function getPublishConfig (config: CommandPublishParams = {}) {
  return omit<CommandPublishParams, 'mode'>(config, ['mode'])
}
