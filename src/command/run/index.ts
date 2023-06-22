import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type { PluginData } from '../../defaultOptions'
import { Context } from '../../lib/context'
export {
  commandRun,
  createRunPlugin,
}
async function main (context: Context, cmd: string, mode: RunMode = 'work') {
  const runCmd = `npm run ${cmd}`
  const diffDirs = await context.storeCommand[`${mode}DiffFile`]()
  const analysisDiagram = context.contextAnalysisDiagram.analysisDiagram
  // scripts有该功能才触发
  const dirs = diffDirs.filter(dir => !!analysisDiagram[dir].packageJson?.scripts?.[cmd])
  const result = context.storeCommand.commandRun(dirs, runCmd)
  return result
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
