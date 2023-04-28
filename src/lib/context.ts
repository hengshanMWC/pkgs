import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  assignOptions,
  getYamlPackages,
  getJSON,
} from '../utils'
import type { ExecuteCommandConfig } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { PACKAGES_PATH } from '../constant'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { StoreCommand } from './storeCommand'

export class Context {
  config: ExecuteCommandConfig
  contextAnalysisDiagram!: ContextAnalysisDiagram
  storeCommand!: StoreCommand

  static configName = 'pkgs.json'

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
    context.storeCommand = new StoreCommand(contextAnalysisDiagram, context.config.rootPackage, git)

    return context
  }

  static async assignConfig (...config: Partial<ExecuteCommandConfig>[]) {
    const pkgsJson = (await getJSON(
      Context.configName,
    )) as Partial<ExecuteCommandConfig>
    return assignOptions(defaultOptions, pkgsJson, ...config)
  }

  constructor (
    config: ExecuteCommandConfig,
  ) {
    this.config = config
  }

  assignOptions (...config: Partial<ExecuteCommandConfig>[]) {
    this.config = assignOptions(this.config, ...config)
    if (this.storeCommand) {
      this.storeCommand.rootPackage = this.config.rootPackage
    }
    if (this.contextAnalysisDiagram) {
      this.contextAnalysisDiagram.packagesPath = this.config.packagesPath
    }
  }

  getCorrectOptionValue (
    cmd: CMD,
    key: keyof ExecuteCommandConfig &
    keyof ExecuteCommandConfig['version'] &
    keyof ExecuteCommandConfig['publish'],
  ) {
    const config = this.config
    const cmdObject = config[cmd]

    if (typeof cmdObject === 'object') {
      return cmdObject[key] === undefined ? config[key] : cmdObject[key]
    }
    else {
      return config[key]
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
