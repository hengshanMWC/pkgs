import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import { Context } from '../../lib/context'
import type { PluginData } from '../type'
import type { AnalysisBlockItem } from '../../lib'
import { BaseExecuteTask, SerialExecuteManage } from '../../execute/lib'
import { getConfigValue } from '../../utils'
import { DAG, Mode, ModeOptions, NoDAG, NoDSerial, Serial } from '../../constant'
import type { TaskItem } from '../../execute'
import type { CommandRunParams } from './type'
import { handleDiffRun, handleSyncRun } from './utils'

async function commandMain(context: Context, cmd: string) {
  let diffDirs: string[]

  if (getConfigValue(context.config, 'run', 'mode') === Mode.DIFF)
    diffDirs = await handleDiffRun(context)

  else
    diffDirs = await handleSyncRun(context)

  const DAG = context.config.run.DAG
  const serial = context.config.run.serial

  // scripts有该功能才触发
  const cmdDirs = diffDirs.filter(
    dir => !!context.contextAnalysisDiagram.dirToAnalysisBlock(dir)?.packageJson?.scripts?.[cmd],
  )

  // 拓扑排序
  const cwds = DAG ? context.contextAnalysisDiagram.getMyRelyDir(cmdDirs) : cmdDirs

  const analysisBlockList = cwds
    .map(cwd => context.contextAnalysisDiagram.dirToAnalysisBlock(cwd))
    .filter(analysisBlock => analysisBlock) as AnalysisBlockItem[]

  let taskList: TaskItem[] = cwds.map((cwd) => {
    return new BaseExecuteTask(
      context.packageManager.run(cmd, context.ttArgv, { cwd }),
    )
  })

  // 串行
  if (serial) {
    const serialExecuteManage = new SerialExecuteManage()
    taskList = [serialExecuteManage.pushTask(...taskList)]
  }

  context.executeManage.enterMainResult({
    analysisBlockList,
    taskList,
  })
  return context
}

export async function parseCommandRun(
  cmd: string,
  configParam: CommandRunParams = {},
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

export async function commandRun(
  cmd: string,
  configParam: CommandRunParams = {},
  git: SimpleGit = simpleGit(),
  argv?: string[],
) {
  const context = await parseCommandRun(cmd, configParam, git, argv)
  const executeCommandResult = await context.executeManage.execute()
  return {
    analysisBlockList: context.executeManage.getCommandData().analysisBlockList,
    executeResult: executeCommandResult,
  }
}

export function createRunPlugin(): PluginData {
  return {
    id: 'run',
    command: 'run <cmd>',
    description: 'run diff scripts.\n type: all | work | stage | repository, default: all',
    options: [
      ['--type <type>', 'all | work | stage | repository'],
      ModeOptions,
      DAG,
      NoDAG,
      Serial,
      NoDSerial,
    ],
    allowUnknownOption: true,
    action: async (context: Context, cmd: string, params: CommandRunParams = {}) => {
      context.assignOptions({
        run: params,
      })
      await commandMain(context, cmd)
      const result = await context.executeManage.execute()
      return result
    },
  }
}
