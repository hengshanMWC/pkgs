import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandPublishParams, PluginData } from '../type'
import { runCommandList } from '../../utils'
import { handleDiffPublish, handleSyncPublish } from './utils'

async function main (context: Context) {
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
  const result = await main(context)
  return result
}

export async function commandPublish (
  configParam: CommandPublishParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const result = await parseCommandPublish(configParam, git, argv)
  await runCommandList(result.commandList)
  return result
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
      const { commandList } = await main(context)
      await runCommandList(commandList)
    },
  }
}
