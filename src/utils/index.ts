import { $ } from 'execa'
import { readJSON, writeJSON, readFile } from 'fs-extra'
import yaml from 'js-yaml'
import colors from 'colors'
import type { IPackageJson } from '@ts-type/package-dts'
import { getPackagesDir } from '@abmao/forb'
import { omit } from 'lodash'
import type { DefaultParams, ExecuteCommandCli, ExecuteCommandConfig } from '../defaultOptions'
import type { CommandResult } from '../command'
import { DEPENDENCY_PREFIX, WORK_SPACE_REG_EXP, gitCommitMessage } from './regExp'
export const isTest = process.env.NODE_ENV === 'test'
export async function getJSON (dir: string): Promise<IPackageJson> {
  try {
    return await readJSON(dir)
  }
  catch {
    return {}
  }
}
export async function getJSONs (dirs: string[]) {
  return Promise.all(dirs.map(dir => getJSON(dir)))
}
export interface WriteObject {
  filePath: string
  packageJson: IPackageJson
}
export async function writeFiles (writesObject: WriteObject[]) {
  return Promise.all(
    writesObject.map(writeObject => writeJSON(
      writeObject.filePath,
      writeObject.packageJson,
      { spaces: 2 },
    )),
  )
}
export function cdDir (dir?: string) {
  return dir ? `cd ${dir} && ` : ''
}
export function assignOptions (
  ...objects: ExecuteCommandCli[]
): ExecuteCommandConfig {
  return objects.reduce((previousValue, currentValue) => {
    return assignOption(
      previousValue,
      currentValue,
    )
  }, {}) as ExecuteCommandConfig
}
function assignOption (
  templateObject: ExecuteCommandCli,
  object: ExecuteCommandCli,
): ExecuteCommandCli {
  if (object.packagesPath !== undefined) {
    templateObject.packagesPath = object.packagesPath
  }
  if (object.mode !== undefined) {
    templateObject.mode = object.mode
  }
  if (object.version !== undefined) {
    if (templateObject.version === undefined) {
      templateObject.version = {}
    }
    if (object.version.message !== undefined) {
      templateObject.version.message = object.version.message
    }
  }
  if (object.publish !== undefined) {
    if (templateObject.publish === undefined) {
      templateObject.publish = {}
    }
    if (object.publish.message !== undefined) {
      templateObject.publish.message = object.publish.message
    }
  }
  if (object.run !== undefined) {
    if (templateObject.run === undefined) {
      templateObject.run = {}
    }
    if (object.run.type !== undefined) {
      templateObject.run.type = object.run.type
    }
  }
  if (object.plugins !== undefined) {
    if (templateObject.plugins === undefined) {
      templateObject.plugins = []
    }
    templateObject.plugins = templateObject.plugins.concat(object.plugins)
  }
  return templateObject
}
export function warn (text: string) {
  console.warn(`${colors.yellow.bold(text)}`)
}
export function err (text: string) {
  console.error(`${colors.red.bold(text)}`)
}
export function isVersionStar (version: string) {
  return DEPENDENCY_PREFIX.test(version)
}
export function getWorkspaceVersion (version: string) {
  return version.replace(WORK_SPACE_REG_EXP, '')
}
export function createCommand (cmd: string, dirs: string[]) {
  if (!dirs.length) return []
  return dirs
    .map(dir => `${cdDir(dir)}${cmd}`)
}
export async function runCmdList (cmdStrList: string[]) {
  const result: string[] = []
  const cmdList = cmdStrList.map(cmd => {
    if (isTest) {
      return Promise.resolve(cmd)
    }
    else {
      return $({ stdio: 'inherit' })`${cmd}`
        .then(() => cmd)
        .catch(e => {
          err(`${e}`)
          return Promise.reject(e)
        })
    }
  })
  const cmdResultList = await Promise.allSettled(cmdList)
  cmdResultList.forEach(item => {
    if (item.status === 'fulfilled') {
      result.push(item.value)
    }
  })
  return result
}

export async function getYamlPackages (): Promise<string[]> {
  const doc: any = yaml.load(await readFile('pnpm-workspace.yaml', 'utf8'))
  return doc.packages as string[]
}

export function getArray<T> (params: T | T[]): T[] {
  return Array.isArray(params) ? params : [params]
}

export function sortFilesName (files: string[]) {
  return files.slice().sort((a, b) => a.localeCompare(b))
}

export function gitCommitMessageFormat (message: string, replaceMessage: string) {
  return message.replace(gitCommitMessage, replaceMessage)
}

export async function getDirPackageInfo (packagesPath: string | string[]) {
  const defaultDirPath = {
    dirs: [''],
    filesPath: ['package.json'],
  }
  try {
    const dirPath = await getPackagesDir(packagesPath)
    if (dirPath.dirs.length) {
      return dirPath
    }
    else {
      return defaultDirPath
    }
  }
  catch {
    return defaultDirPath
  }
}

export function fileMatch (files: string[], dir: string) {
  return files.some(file => file.includes(dir))
}

export function parserCommandResult (argv: string[]): CommandResult {
  const _argv = argv.slice()
  return {
    agent: _argv.shift() || '',
    args: _argv,
    options: {},
  }
}

export function omitDefaultParams<T extends Partial<DefaultParams>> (config: T) {
  return omit<T, 'mode'>(config, ['mode'])
}
