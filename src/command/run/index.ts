import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type { PluginData } from '../../defaultOptions'
import { Context } from '../../lib/context'
export {
  commandRun,
  createRunPlugin,
}
async function main (context: Context, cmd: string, mode: RunMode = 'work', rootPackage = true) {
  context.assignOptions({
    rootPackage,
  })
  await context.storeCommand[`${mode}Command`](cmd)
}
// all
type RunMode = 'work' | 'stage' | 'repository'

async function commandRun (
  cmd: string,
  mode?: RunMode,
  rootPackage?: boolean,
  git: SimpleGit = simpleGit(),
) {
  const context = await Context.create(
    undefined,
    git,
  )
  await main(context, cmd, mode, rootPackage)
}

function createRunPlugin (): PluginData {
  return {
    id: 'run',
    command: 'run <cmd> [mode]',
    description: 'run diff scripts.\n mode: work | stage | repository, default: work',
    option: [
      ['-r <boolean>', 'Include rootPackage', 'true'],
    ],
    action: (context, cmd: string, mode?: RunMode, option: { r?: 'false' | 'true' } = {}) => {
      return main(context, cmd, mode, option.r !== 'false')
    },
  }
}
