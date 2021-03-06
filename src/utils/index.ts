import { execSync } from 'child_process'
import { readJSON, writeJSON, readFile } from 'fs-extra'
import yaml from 'js-yaml'
import colors from 'colors'
import type { IPackageJson } from '@ts-type/package-dts'
import { DEPENDENCY_PREFIX } from '../constant'
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
export function assign<T extends Object> (
  ...objects: Partial<T>[]
): T {
  return objects.reduce((previousValue: any, currentValue) => {
    for (const key in currentValue) {
      previousValue[key] =
        getAssign<T>(
          previousValue[key],
          currentValue[key as keyof T],
        )
    }
    return previousValue
  }, {}) as T
}
function getAssign<T> (templateObject: any, object: any): T {
  if (typeof templateObject === 'object') {
    if (typeof object === 'object') {
      return assign(templateObject, object)
    }
    return templateObject
  }
  else {
    return object === undefined ? templateObject : object
  }
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
