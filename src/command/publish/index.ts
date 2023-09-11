import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandPublishParams, ExecuteCommandResult, PluginData } from '../type'
import { executeCommandList } from '../../utils'
import { handleDiffPublish, handleSyncPublish } from './utils'

async function commandMain (context: Context) {
  if (context.config.mode === 'diff') {
    return handleDiffPublish(context)
  }
  else {
    return handleSyncPublish(context)
  }
}

export async function parseCommandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    publish: omit<CommandPublishParams, 'mode'>(configParam, ['mode']),
  })
  const context = await Context.create(
    config,
    git,
    argv,
  )
  const result = await commandMain(context)
  return result
}

export async function commandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
): Promise<ExecuteCommandResult> {
  const commandMainResult = await parseCommandPublish(configParam, git, argv)
  const executeCommandResult = await executeCommandList(commandMainResult.commandList)
  return {
    ...commandMainResult,
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
        publish: params,
      })
      const { commandList } = await commandMain(context)
      await executeCommandList(commandList)
    },
  }
}
