import type { SimpleGit } from 'simple-git'
import { loadConfig } from 'load-code'
import {
  assignOptions,
} from '../utils'
import type { ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { Agent, PACKAGES_PATH } from '../constant'
import type { Manager } from '../manager'
import { agentSmell } from '../manager'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { FileStore } from './fileStore'
import { Execute } from './executeManage'
import type { FileStoreApi, contextAnalysisDiagramApi } from '.'

export class Context {
  config: ExecuteCommandConfig
  contextAnalysisDiagram!: contextAnalysisDiagramApi
  fileStore!: FileStoreApi
  packageManager!: Manager
  executeManage = new Execute()
  argv: ContextParams['argv']
  args: ContextParams['args']
  ttArgv: ContextParams['ttArgv'] = []

  static cli = Agent.PKGS

  static async create (
    {
      config,
      git,
      argv,
      args,
      ttArgv,
    }: ContextParams,
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
    const context = new Context(contextConfig, argv, args, ttArgv)
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
    args?: any[],
    ttArgv?: string[],
  ) {
    this.config = config
    this.argv = argv
    this.args = args
    if (ttArgv) {
      this.ttArgv = ttArgv
    }
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
}

interface ContextParams {
  config?: ConstructorParameters<typeof Context>[0]
  git?: SimpleGit
  argv?: string[]
  args?: any[]
  ttArgv?: string[]
}
