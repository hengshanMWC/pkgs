import { execSync } from 'child_process'
import { readJSON, writeJSON, readFile } from 'fs-extra'
import yaml from 'js-yaml'
import colors from 'colors'
import type { IPackageJson } from '@ts-type/package-dts'
import strip from 'strip-json-comments'
import { DEPENDENCY_PREFIX } from '../constant'
import type { ExecuteCommandConfig } from '../defaultOptions'
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
  ...objects: Partial<ExecuteCommandConfig>[]
): ExecuteCommandConfig {
  return objects.reduce((previousValue, currentValue) => {
    return assignOption(
      previousValue,
      currentValue,
    )
  }, {}) as ExecuteCommandConfig
}
function assignOption (
  templateObject: Partial<ExecuteCommandConfig>,
  object: Partial<ExecuteCommandConfig>,
): Partial<ExecuteCommandConfig> {
  if (object.mode !== undefined) {
    templateObject.mode = object.mode
  }
  if (object.packagesPath !== undefined) {
    templateObject.packagesPath = object.packagesPath
  }
  if (object.rootPackage !== undefined) {
    templateObject.rootPackage = object.rootPackage
  }
  if (object.version !== undefined) {
    if (templateObject.version === undefined) {
      templateObject.version = {}
    }
    if (object.version.mode !== undefined) {
      templateObject.version.mode = object.version.mode
    }
    if (object.version.message !== undefined) {
      templateObject.version.message = object.version.message
    }
  }
  if (object.publish !== undefined) {
    if (templateObject.publish === undefined) {
      templateObject.publish = {}
    }
    if (object.publish.mode !== undefined) {
      templateObject.publish.mode = object.publish.mode
    }
    if (object.publish.tag !== undefined) {
      templateObject.publish.tag = object.publish.tag
    }
    if (object.plugins !== undefined) {
      if (templateObject.plugins === undefined) {
        templateObject.plugins = []
      }
      templateObject.plugins = templateObject.plugins.concat(object.plugins)
    }
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
  return version.includes(DEPENDENCY_PREFIX)
}

export function createCommand (cmd: string, dirs: string[]) {
  if (!dirs.length) return []
  return dirs
    .map(dir => `${dir ? `cd ${dir} && ` : ''}npm run ${cmd}`)
}
export type statusRunCmds = 'allSuccess' | 'allError' | 'error'
export function runCmds (cmds: string[]): statusRunCmds {
  let status: statusRunCmds = 'allSuccess'
  let index = 1
  cmds.forEach(cmd => {
    try {
      execSync(cmd, {
        stdio: 'inherit',
      })
    }
    catch (e) {
      if (index++ < cmds.length) {
        status = 'error'
      }
      else {
        status = 'allError'
      }
      err(`${e}`)
    }
  })
  return status
}

export async function getYamlPackages (): Promise<string[]> {
  const doc: any = yaml.load(await readFile('pnpm-workspace.yaml', 'utf8'))
  return doc.packages as string[]
}

export function getArray<T> (params: T | T[]): T[] {
  return Array.isArray(params) ? params : [params]
}

export function getExportDefault (code: any) {
  return code?.__esModule ? code.default : code
}

export function jsoncParse (data: string) {
  try {
    return new Function(`return ${strip(data).trim()}`)()
  }
  catch {
    // Silently ignore any error
    // That's what tsc/jsonc-parser did after all
    return {}
  }
}
