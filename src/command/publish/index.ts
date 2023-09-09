import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandPublishParams, PluginData, RunResult } from '../type'
import { isTest, runCommand } from '../../utils'
import { handleDiffPublish, handleSyncPublish } from './utils'

async function main (context: Context) {
  let result: RunResult
  if (context.config.mode === 'diff') {
    result = await handleDiffPublish(context)
  }
  else {
    result = await handleSyncPublish(context)
  }
  if (!isTest) {
    const runList = result.commandList.map(command => {
      return runCommand(command.agent, command.args, command.options)
    })
    await Promise.all(runList)
  }
  return result
}
export async function commandPublish (
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

export function createPublishPlugin (): PluginData {
  return {
    id: 'publish',
    command: 'publish',
    description: 'publish package',
    option: [
      ['-message <message>', 'npm publish --message <message>'],
      ['-tag <type>', 'npm publish --tag <tag>'],
    ],
    action (context: Context, params: CommandPublishParams = {}) {
      context.assignOptions({
        publish: params,
      })
      main(context)
    },
  }
}
