import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  assignOptions,
  getYamlPackages,
  getJSON,
  getArray,
} from './utils'
import { cmdVersion, cmdPublish } from './cmd'
import { StoreCommand } from './storeCommand'
import { ContextAnalysisDiagram } from './analysisDiagram'
import type { ExecuteCommandOptions } from './defaultOptions'
import { defaultOptions } from './defaultOptions'
import { PACKAGES_PATH } from './constant'
import { PluginStore } from './plugin'
import { versionPlugin } from './plugin/version'

export class Context {
  options: ExecuteCommandOptions
  contextAnalysisDiagram!: ContextAnalysisDiagram
  storeCommand!: StoreCommand
  pluginStore!: PluginStore

  static configName = 'pkgs.json'

  static async create (
    config?: ConstructorParameters<typeof Context>[0],
    git: SimpleGit = simpleGit(),
  ) {
    // 多份配置整合
    const configs = []
    const pkgsJson = (await getJSON(
      Context.configName,
    )) as Partial<ExecuteCommandOptions>
    configs.push(pkgsJson)
    config && configs.push(...getArray<Partial<ExecuteCommandOptions>>(config))

    const context = new Context(configs)
    await context.readDefaultPackagesPath()

    // 生成包之间的图表关系
    const contextAnalysisDiagram = new ContextAnalysisDiagram(context.options.packagesPath)
    await contextAnalysisDiagram.initData()
    context.contextAnalysisDiagram = contextAnalysisDiagram

    // 命令系统
    context.storeCommand = new StoreCommand(contextAnalysisDiagram, context.options.rootPackage, git)

    // 插件系统
    const pluginStore = new PluginStore()
    pluginStore.use(versionPlugin)
    context.pluginStore = pluginStore

    return context
  }

  constructor (
    config: Partial<ExecuteCommandOptions> | Partial<ExecuteCommandOptions>[],
  ) {
    this.options = assignOptions(defaultOptions, ...getArray<Partial<ExecuteCommandOptions>>(config))
  }

  get allDirs () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(key => key)
    }
    else {
      return []
    }
  }

  get allFilesPath () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(
        key => this.contextAnalysisDiagram.analysisDiagram[key].filePath,
      )
    }
    else {
      return []
    }
  }

  get allPackagesJSON () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).map(
        key => this.contextAnalysisDiagram.analysisDiagram[key].packageJson,
      )
    }
    else {
      return []
    }
  }

  get dirs () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram).filter(key => key)
    }
    else {
      return []
    }
  }

  get filesPath () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram)
        .filter(item => item)
        .map(key => this.contextAnalysisDiagram.analysisDiagram[key].filePath)
    }
    else {
      return []
    }
  }

  get packagesJSON () {
    if (this.contextAnalysisDiagram.analysisDiagram) {
      return Object.keys(this.contextAnalysisDiagram.analysisDiagram)
        .filter(key => key)
        .map(key => this.contextAnalysisDiagram.analysisDiagram[key].packageJson)
    }
    else {
      return []
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

  async cmdVersion (version?: string) {
    await cmdVersion(this, version)
  }

  async cmdPublish () {
    await cmdPublish(this)
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
