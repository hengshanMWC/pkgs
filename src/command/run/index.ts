import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import { Context } from '../../lib/context'
import type { CommandMainResult, PluginData } from '../type'
import type { AnalysisBlockItem } from '../../lib'
import type { CommandRunParams } from './type'
import { handleDiffRun, handleSyncRun } from './utils'
async function commandMain (context: Context, cmd: string) {
  const args = ['run', cmd]
  let diffDirs: string[]

  if (context.config.mode === 'diff') {
    diffDirs = await handleDiffRun(context)
  }
  else {
    diffDirs = await handleSyncRun(context)
  }

  // scripts有该功能才触发
  const cmdDirs = diffDirs.filter(
    dir => !!context.contextAnalysisDiagram.dirToAnalysisDiagram(dir)?.packageJson?.scripts?.[cmd],
  )

  const cwds = context.contextAnalysisDiagram.getDirTopologicalSorting(cmdDirs)

  const analysisBlockList = cwds
    .map(cwd => context.contextAnalysisDiagram.dirToAnalysisDiagram(cwd))
    .filter(analysisBlock => analysisBlock) as AnalysisBlockItem[]
  const commandMainResult: CommandMainResult = {
    analysisBlockList,
    commandList: cwds.map(cwd => {
      return {
        agent: context.packageManager.agent,
        args,
        options: { stdio: 'inherit', cwd },
      }
    }),
  }
  return context.enterCommandResult(commandMainResult)
}

export async function parseCommandRun (
  configParam: CommandRunParams = {},
  cmd: string,
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    run: omit<CommandRunParams, 'mode'>(configParam, ['mode']),
  })
  const context = await Context.create(
    config,
    git,
    argv,
  )
  return commandMain(context, cmd)
}

export async function commandRun (
  configParam: CommandRunParams = {},
  cmd: string,
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const context = await parseCommandRun(configParam, cmd, git, argv)
  const executeCommandResult = await context.execute.outRun()
  return {
    ...context.getCommandResult(),
    executeResult: executeCommandResult,
  }
}

export function createRunPlugin (): PluginData {
  return {
    id: 'run',
    command: 'run <cmd>',
    description: 'run diff scripts.\n type: all | work | stage | repository, default: all',
    option: [
      ['--type <type>', 'all | work | stage | repository'],
      ['--mode <mode>', 'sync | diff'],
    ],
    action: async (context: Context, cmd: string, params: CommandRunParams = {}) => {
      context.assignOptions({
        mode: params.mode,
        run: params,
      })
      await commandMain(context, cmd)
      await context.execute.outRun()
    },
  }
}
