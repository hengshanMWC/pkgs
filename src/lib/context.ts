import { simpleGit } from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { loadConfig } from 'load-code'
import {
  assignOptions,
  warn,
} from '../utils'
import type { ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { Agent, PACKAGES_PATH, WARN_NOW_RUN } from '../constant'
import type { Manager } from '../manager'
import { agentSmell } from '../manager'
import { BaseExecuteManage } from '../execute/lib'
import type { HandleMainResult } from '../command'
import type { AnalysisBlockItem } from './analysisDiagram'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { FileStore } from './fileStore'
export class Context {
  config: ExecuteCommandConfig
  contextAnalysisDiagram!: ContextAnalysisDiagram
  fileStore!: FileStore
  packageManager!: Manager
  execute: BaseExecuteManage
  argv: string[]
  affectedAnalysisBlockList: AnalysisBlockItem[] = []

  static cli = Agent.PKGS

  static async create (
    config?: ConstructorParameters<typeof Context>[0],
    git: SimpleGit = simpleGit(),
    argv?: string[],
  ) {
    let contextConfig: ConstructorParameters<typeof Context>[0]
    if (config) {
      contextConfig = config
    }
    else {
      contextConfig = await Context.assignConfig()
    }

    // 初始化包管理
    const packageManager = await agentSmell()
    const packageManagerConfig = await packageManager.getConfig()
    contextConfig = assignOptions({
      packagesPath: PACKAGES_PATH,
    }, packageManagerConfig, contextConfig)

    // 创建上下文
    const context = new Context(contextConfig, argv)
    context.packageManager = packageManager

    // 生成包之间的图表关系
    const contextAnalysisDiagram = new ContextAnalysisDiagram(context.config.packagesPath)
    await contextAnalysisDiagram.initData()
    context.contextAnalysisDiagram = contextAnalysisDiagram

    // 命令系统
    context.fileStore = new FileStore(contextAnalysisDiagram, git)

    return context
  }

  static async assignConfig (...config: ExecuteCommandCli[]) {
    const configData = await loadConfig(Context.cli)
    return assignOptions(defaultOptions, configData.data || {}, ...config)
  }

  constructor (
    config: ExecuteCommandConfig,
    argv: string[] = process.argv,
  ) {
    this.config = config
    this.argv = argv
    this.execute = new BaseExecuteManage()
  }

  get argvValue () {
    if (this.argv) {
      return this.argv.slice(2).filter(Boolean)
    }
    else {
      return []
    }
  }

  assignOptions (...config: ExecuteCommandCli[]) {
    this.config = assignOptions(this.config, ...config)
    if (this.contextAnalysisDiagram) {
      this.contextAnalysisDiagram.packagesPath = this.config.packagesPath
    }
    return this
  }

  enterMainResult (commandMainResult: HandleMainResult) {
    this
      .setAffectedAnalysisBlockList(commandMainResult.analysisBlockList)
      .execute
      .pushTask(...commandMainResult.taskList)
    return this
  }

  setAffectedAnalysisBlockList (analysisBlockLis: AnalysisBlockItem[]) {
    this.affectedAnalysisBlockList = analysisBlockLis
    return this
  }

  executeRun () {
    if (!this.execute.existTask) {
      warn(WARN_NOW_RUN)
    }
    return this.execute.run()
  }
}
