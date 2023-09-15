import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import {
  Context,
} from '../../lib/context'
import type { CommandVersionParams, PluginData } from '../type'
import { omitDefaultParams } from '../../utils'
import { handleDiffVersion, handleSyncVersion } from './utils'
function commandMain (context: Context, appointVersion?: string) {
  if (context.config.mode === 'diff') {
    return handleDiffVersion(context, appointVersion)
  }
  else {
    return handleSyncVersion(context, appointVersion)
  }
}
export async function commandVersion (
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
  const result = await commandMain(context, appointVersion)
  return result
}
export function createVersionPlugin (): PluginData {
  return {
    id: 'version',
    command: 'version',
    description: 'version package',
    option: [
      ['--mode <type>', 'sync | diff'],
      ['-m, --message <message>', 'commit message'],
    ],
    action (context: Context, config: CommandVersionParams = {}) {
      context.assignOptions({
        mode: config.mode,
        version: omitDefaultParams(config),
      })
      commandMain(context)
    },
  }
}
