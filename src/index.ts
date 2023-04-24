import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import {
  getYamlPackages,
} from './utils'
import { cmdVersion, cmdPublish } from './cmd'
import { StoreCommand } from './storeCommand'
import { ContextAnalysisDiagram } from './analysisDiagram'
import type { ExecuteCommandOptions } from './defaultOptions'
import { PACKAGES_PATH } from './constant'
import { PluginStore } from './plugin'
import { versionPlugin } from './plugin/version'

export class Context {
  options: ExecuteCommandOptions
  contextAnalysisDiagram!: ContextAnalysisDiagram
  storeCommand!: StoreCommand
  pluginStore!: PluginStore

  constructor (
    options: ExecuteCommandOptions,
  ) {
    this.options = options
  }

  static async create (
    options: ExecuteCommandOptions,
    git: SimpleGit = simpleGit(),
  ) {
    const attrOptions = options

    // 同步pnpm-workspace.yaml的packagesPath
    if (!attrOptions.packagesPath) {
      try {
        attrOptions.packagesPath = await getYamlPackages()
      }
      catch {
        attrOptions.packagesPath = PACKAGES_PATH
      }
    }

    const context = new Context(attrOptions)

    const contextAnalysisDiagram = new ContextAnalysisDiagram(context.options.packagesPath)
    await contextAnalysisDiagram.initData()
    context.contextAnalysisDiagram = contextAnalysisDiagram

    context.storeCommand = new StoreCommand(contextAnalysisDiagram, context.options.rootPackage, git)

    const pluginStore = new PluginStore()
    pluginStore.use(versionPlugin)
    context.pluginStore = pluginStore

    return context
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
}
export type CMD = 'version' | 'publish'
