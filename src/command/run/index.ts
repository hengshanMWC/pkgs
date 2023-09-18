import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import { Context } from '../../lib/context'
import type { PluginData } from '../type'
import type { AnalysisBlockItem } from '../../lib'
import { BaseExecuteTask } from '../../execute/lib'
import { getConfigValue, mixinDefaultOptions } from '../../utils'
import { Mode, ModeOptions } from '../../constant'
import type { CommandRunParams } from './type'
import { handleDiffRun, handleSyncRun } from './utils'
async function commandMain (context: Context, cmd: string) {
  const args = ['run', cmd]
  let diffDirs: string[]

  if (getConfigValue(context.config, 'run', 'mode') === Mode.DIFF) {
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
  const taskList = cwds.map(cwd => {
    return new BaseExecuteTask({
      agent: context.packageManager.agent,
      args,
      options: mixinDefaultOptions({ cwd }),
    })
  })
  context.executeManage.enterMainResult({
    analysisBlockList,
    taskList,
  })
  return context
}

export async function parseCommandRun (
  configParam: CommandRunParams = {},
  cmd: string,
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const config = await Context.assignConfig({
    run: configParam,
  })
  const context = await Context.create({
    config,
    git,
    argv,
  })
  return commandMain(context, cmd)
}

export async function commandRun (
  configParam: CommandRunParams = {},
  cmd: string,
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const context = await parseCommandRun(configParam, cmd, git, argv)
  const executeCommandResult = await context.executeManage.execute()
  return {
    analysisBlockList: context.executeManage.getCommandData().analysisBlockList,
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
      ModeOptions,
    ],
    action: async (context: Context, cmd: string, params: CommandRunParams = {}) => {
      context.assignOptions({
        run: params,
      })
      await commandMain(context, cmd)
      await context.executeManage.execute()
    },
  }
}
