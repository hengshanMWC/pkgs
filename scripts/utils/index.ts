import { readFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
export async function readJSON (dir: string): Promise<IPackageJson> {
  try {
    return await readFile(dir)
  }
  catch {
    return {}
  }
}
export async function getPackagesJSON (dirs: string[]) {
  const result: IPackageJson[] = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await readFile(dirs[i]))
  }

  return result
}
export function cdDir (dir?: string) {
  return dir ? `cd ${dir} && ` : ''
}
export function cmdOptions<T extends Object, U extends keyof T> (
  cmd: U,
  options: Partial<T>,
  defaultOptions: T,
): T {
  const defaultOption = defaultOptions[cmd]
  // const option = options[cmd] as Partial<Record<keyof T[U], true | string>>
  const option: any = options[cmd]
  if (typeof defaultOption === 'object') {
    const result: any = {
      [cmd]: {},
    }
    for (const key in defaultOption) {
      result[cmd][key] = option[key] !== true
        ? option[key]
        : defaultOption[key]
    }
    return result
  }
  else {
    return defaultOptions
  }
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
export function getAssign<T> (templateObject: any, object: any): T {
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
