import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { PluginData } from '../type'
import type { CommandRunParams } from './type'
import { handleDiffRun, handleSyncRun } from './utils'
export {
  commandRun,
  createRunPlugin,
}
async function main (context: Context, cmd: string) {
  const runCmd = `pnpm run ${cmd}`
  let diffDirs: string[]

  if (context.config.mode === 'diff') {
    diffDirs = await handleDiffRun(context)
  }
  else {
    diffDirs = await handleSyncRun(context)
  }

  const analysisDiagram = context.contextAnalysisDiagram.analysisDiagram
  // scripts有该功能才触发
  const dirs = diffDirs.filter(dir => !!analysisDiagram[dir].packageJson?.scripts?.[cmd])
  const result = context.commandBatchRun(dirs, runCmd)
  return result
}

async function commandRun (
  configParam: CommandRunParams = {},
  cmd: string,
  git: SimpleGit = simpleGit(),
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    run: omit<CommandRunParams, 'mode'>(configParam, ['mode']),
  })
  const context = await Context.create(
    config,
    git,
  )
  const cmdList = await main(context, cmd)
  return cmdList
}

function createRunPlugin (): PluginData {
  return {
    id: 'run',
    command: 'run <cmd> [type]',
    description: 'run diff scripts.\n type: all | work | stage | repository, default: all',
    option: [
      ['--type <type>', 'work | stage | repository'],
      ['--mode <mode>', 'sync | diff'],
    ],
    action: (context: Context, cmd: string, config: CommandRunParams = {}) => {
      context.assignOptions({
        mode: config.mode,
        run: config,
      })
      return main(context, cmd)
    },
  }
}
