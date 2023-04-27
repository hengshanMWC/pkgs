import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  assignOptions,
  getYamlPackages,
  getJSON,
} from '../utils'
import type { ExecuteCommandOptions } from '../defaultOptions'
import { defaultOptions } from '../defaultOptions'
import { PACKAGES_PATH } from '../constant'
import { ContextAnalysisDiagram } from './analysisDiagram'
import { StoreCommand } from './storeCommand'

export class Context {
  options: ExecuteCommandOptions
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
    const contextAnalysisDiagram = new ContextAnalysisDiagram(context.options.packagesPath)
    await contextAnalysisDiagram.initData()
    context.contextAnalysisDiagram = contextAnalysisDiagram

    // 命令系统
    context.storeCommand = new StoreCommand(contextAnalysisDiagram, context.options.rootPackage, git)

    return context
  }

  static async assignConfig (...config: Partial<ExecuteCommandOptions>[]) {
    const pkgsJson = (await getJSON(
      Context.configName,
    )) as Partial<ExecuteCommandOptions>
    return assignOptions(defaultOptions, pkgsJson, ...config)
  }

  constructor (
    config: ExecuteCommandOptions,
  ) {
    this.options = config
  }

  assignOptions (...config: Partial<ExecuteCommandOptions>[]) {
    this.options = assignOptions(this.options, ...config)
    if (this.storeCommand) {
      this.storeCommand.rootPackage = this.options.rootPackage
    }
    if (this.contextAnalysisDiagram) {
      this.contextAnalysisDiagram.packagesPath = this.options.packagesPath
    }
  }

  getCorrectOptionValue (
    cmd: CMD,
    key: keyof ExecuteCommandOptions &
    keyof ExecuteCommandOptions['version'] &
    keyof ExecuteCommandOptions['publish'],
  ) {
    const options = this.options
    const cmdObject = options[cmd]

    if (typeof cmdObject === 'object') {
      return cmdObject[key] === undefined ? options[key] : cmdObject[key]
    }
    else {
      return options[key]
    }
  }

  private async readDefaultPackagesPath () {
    if (!this.options.packagesPath) {
      try {
        // 同步pnpm-workspace.yaml的packagesPath
        this.options.packagesPath = await getYamlPackages()
      }
      catch {
        this.options.packagesPath = PACKAGES_PATH
      }
    }
  }
}
export type CMD = 'version' | 'publish'
