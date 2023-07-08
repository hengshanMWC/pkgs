import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  assignOptions,
  getYamlPackages,
} from '../utils'
import type { ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { PACKAGES_PATH } from '../constant'
import { loadConfig } from '../config'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { StoreCommand } from './storeCommand'

export class Context {
  config: ExecuteCommandConfig
  contextAnalysisDiagram!: ContextAnalysisDiagram
  storeCommand!: StoreCommand

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
    context.storeCommand = new StoreCommand(contextAnalysisDiagram, git)

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
  }
}
export type CMD = 'version' | 'publish'
