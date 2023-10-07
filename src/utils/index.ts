import type { Options } from 'execa'
import { readFile, readJSON } from 'fs-extra'
import yaml from 'js-yaml'
import colors from 'colors'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import { Command } from 'commander'
import { isString } from 'lodash'
import type { DefaultParams, ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import { DEPENDENCY_PREFIX, WORK_SPACE_REG_EXP, gitCommitMessage } from './regExp'

export const isTest = process.env.NODE_ENV === 'test'
export async function getJSON(dir: string): Promise<IPackageJson> {
  try {
    return await readJSON(dir)
  }
  catch {
    return {}
  }
}
export async function getJSONs(dirs: string[]) {
  return Promise.all(dirs.map(dir => getJSON(dir)))
}
export function assignOptions(
  ...objects: ExecuteCommandCli[]
): ExecuteCommandConfig {
  return objects.reduce((previousValue, currentValue) => {
    return assignOption(
      previousValue,
      currentValue,
    )
  }, {}) as ExecuteCommandConfig
}
function assignOption(
  templateObject: ExecuteCommandCli,
  object: ExecuteCommandCli,
): ExecuteCommandCli {
  if (object.packagesPath !== undefined)
    templateObject.packagesPath = object.packagesPath

  if (object.mode !== undefined)
    templateObject.mode = object.mode

  if (object.push !== undefined)
    templateObject.push = object.push

  if (object.version !== undefined) {
    if (templateObject.version === undefined)
      templateObject.version = {}

    if (object.version.message !== undefined)
      templateObject.version.message = object.version.message

    if (object.version.mode !== undefined)
      templateObject.version.mode = object.version.mode

    if (object.version.push !== undefined)
      templateObject.version.push = object.version.push
  }
  if (object.publish !== undefined) {
    if (templateObject.publish === undefined)
      templateObject.publish = {}

    if (object.publish.mode !== undefined)
      templateObject.publish.mode = object.publish.mode

    if (object.publish.push !== undefined)
      templateObject.publish.push = object.publish.push
  }
  if (object.run !== undefined) {
    if (templateObject.run === undefined)
      templateObject.run = {}

    if (object.run.type !== undefined)
      templateObject.run.type = object.run.type

    if (object.run.mode !== undefined)
      templateObject.run.mode = object.run.mode
  }
  if (object.plugins !== undefined) {
    if (templateObject.plugins === undefined)
      templateObject.plugins = []

    templateObject.plugins = templateObject.plugins.concat(object.plugins)
  }
  return templateObject
}
export function warn(text: string) {
  console.warn(`${colors.yellow.bold(text)}`)
}
export function err(text: string) {
  console.error(`${colors.red.bold(text)}`)
}
export function isVersionStar(version: string) {
  return DEPENDENCY_PREFIX.test(version)
}
export function getWorkspaceVersion(version: string) {
  return version.replace(WORK_SPACE_REG_EXP, '')
}

export async function getYamlPackages(): Promise<string[]> {
  const doc: any = yaml.load(await readFile('pnpm-workspace.yaml', 'utf8'))
  return doc.packages as string[]
}

export function sortFilesName(files: string[]) {
  return files.slice().sort((a, b) => a.localeCompare(b))
}

export function gitCommitMessageFormat(message: string, replaceMessage: string) {
  return message.replace(gitCommitMessage, replaceMessage)
}

export async function getDirPackageInfo(packagesPath: string | string[]) {
  const defaultDirPath = {
    dirs: [''],
    filesPath: ['package.json'],
  }
  try {
    const dirPath = await getPackagesDir(packagesPath)
    if (dirPath.dirs.length)
      return dirPath

    else
      return defaultDirPath
  }
  catch {
    return defaultDirPath
  }
}

export function fileMatch(files: string[], dir: string) {
  return files.some(file => file.includes(dir))
}

export function mixinDefaultOptions(options?: Options): Options {
  return {
    stdio: 'inherit',
    ...options,
  }
}

export function getConfigValue(
  config: ExecuteCommandConfig,
  module: 'publish' | 'version' | 'run',
  key: keyof DefaultParams,
) {
  return config[module][key] ?? config[key]
}

export function getTTArgv(...args: any[]) {
  const command = args.at(-1)
  const ttArgv: string[] = []

  // 拿到透传
  if (command instanceof Command) {
    const commandArgs = command.args
    if (isString(args.at(0))) {
      // run [cmd]
      ttArgv.push(...commandArgs.slice(1))
    }
    else {
      ttArgv.push(...commandArgs)
    }
  }
  return ttArgv
}
