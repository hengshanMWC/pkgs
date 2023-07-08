import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { Context } from '../../lib/context'
import type { ExecuteCommandPublishOption, PluginData } from '../../defaultOptions'
import { handleDiffPublish, handleSyncPublish } from './utils'

function main (context: Context) {
  if (context.config.mode === 'diff') {
    return handleDiffPublish(context)
  }
  else {
    return handleSyncPublish(context)
  }
}
export async function commandPublish (configParam: ExecuteCommandPublishOption = {}, git: SimpleGit = simpleGit()) {
  const config = await Context.assignConfig({
    publish: configParam,
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
    action (context: Context, config: ExecuteCommandPublishOption = {}) {
      context.assignOptions({
        publish: config,
      })
      main(context)
    },
  }
}
