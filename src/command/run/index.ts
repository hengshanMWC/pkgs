import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type { PluginData } from '../../defaultOptions'
import { Context } from '../../lib/context'
export {
  commandRun,
  createRunPlugin,
}
async function main (context: Context, cmd: string, mode: RunMode = 'work') {
  const cmds = await context.storeCommand[`${mode}Command`](`npm run ${cmd}`)
  return cmds
}
// all
type RunMode = 'work' | 'stage' | 'repository'

async function commandRun (
  cmd: string,
  mode?: RunMode,
  git: SimpleGit = simpleGit(),
) {
  const context = await Context.create(
    undefined,
    git,
  )
  const cmds = await main(context, cmd, mode)
  return cmds
}

function createRunPlugin (): PluginData {
  return {
    id: 'run',
    command: 'run <cmd> [mode]',
    description: 'run diff scripts.\n mode: work | stage | repository, default: work',
    action: (context, cmd: string, mode?: RunMode) => {
      return main(context, cmd, mode)
    },
  }
}
