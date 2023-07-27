import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  assignOptions,
  getYamlPackages,
  createCommand,
  runCmdList,
  warn,
} from '../utils'
import type { ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { PACKAGES_PATH, WARN_NOW_RUN } from '../constant'
import { loadConfig } from '../config'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { FileStore } from './fileStore'
export class Context {
  config: ExecuteCommandConfig
  contextAnalysisDiagram!: ContextAnalysisDiagram
  fileStore!: FileStore

  static cli = 'pkgs'

  static async create (
    config?: ConstructorParameters<typeof Context>[0],
    git: SimpleGit = simpleGit(),
  ) {
    let contextConfig: ConstructorParameters<typeof Context>[0]
    if (config) {
      contextConfig = config
    }
    else {
      contextConfig = await Context.assignConfig()
    }
    const context = new Context(contextConfig)
    await context.readDefaultPackagesPath()

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
  ) {
    this.config = config
  }

  assignOptions (...config: ExecuteCommandCli[]) {
    this.config = assignOptions(this.config, ...config)
    if (this.contextAnalysisDiagram) {
      this.contextAnalysisDiagram.packagesPath = this.config.packagesPath
    }
    return this
  }

  async commandBatchRun (diffDirs: string[], cmdStr: string) {
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(diffDirs)
    const cmd = createCommand(cmdStr, orderDirs)

    if (cmd.length) {
      const cmdStrList = await runCmdList(cmd)
      return cmdStrList
    }
    else {
      warn(WARN_NOW_RUN)
    }
  }

  private async readDefaultPackagesPath () {
    if (!this.config.packagesPath) {
      try {
        // 同步pnpm-workspace.yaml的packagesPath
        this.config.packagesPath = await getYamlPackages()
      }
      catch {
        this.config.packagesPath = PACKAGES_PATH
      }
    }
    return this
  }
}
export type CMD = 'version' | 'publish'
