import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { Context } from '../../lib/context'
import type { CommandMainResult, CommandPublishParams, ExecuteCommandResult, PluginData } from '../type'
import { omitDefaultParams } from '../../utils'
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
    publish: omitDefaultParams(configParam),
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
        publish: omitDefaultParams(params),
      })
      await commandMain(context)
      await context.execute.outRun()
    },
  }
}
