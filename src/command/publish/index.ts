import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandPublishParams, PluginData } from '../type'
import { handleDiffPublish, handleSyncPublish } from './utils'

function main (context: Context) {
  if (context.config.mode === 'diff') {
    return handleDiffPublish(context)
  }
  else {
    return handleSyncPublish(context)
  }
}
export async function commandPublish (configParam: CommandPublishParams = {}, git: SimpleGit = simpleGit()) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    publish: omit<CommandPublishParams, 'mode'>(configParam, ['mode']),
  })
  const context = await Context.create(
    config,
    git,
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
    action (context: Context, config: CommandPublishParams = {}) {
      context.assignOptions({
        publish: config,
      })
      main(context)
    },
  }
}
