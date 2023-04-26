import path from 'path'
import { access, mkdir, copyFile, stat } from 'fs-extra'
import type { PluginData } from '../../defaultOptions'
export function commandInit () {
  const packagesName = 'packages'
  const pkgsJsonName = 'pkgs.json'
  const packageJsonName = 'package.json'
  const dirPath = path.resolve(__dirname, './template')
  const pkgsJson = path.resolve(dirPath, pkgsJsonName)
  const packageJson = path.resolve(dirPath, packageJsonName)
  return Promise.all([
    createMkdir(packagesName),
    createFile(pkgsJsonName, pkgsJson),
    createFile(packageJsonName, packageJson),
  ])
}
export function createInitPlugin (): PluginData {
  return {
    id: 'init',
    description: 'create pkgs file',
    action: commandInit,
  }
}
async function createMkdir (dirName: string) {
  try {
    const statResult = await stat(dirName)
    if (!statResult.isDirectory()) {
      throw new Error()
    }
  }
  catch {
    await mkdir(dirName)
  }
}
async function createFile (fileName: string, filePath: string) {
  try {
    await access(fileName)
  }
  catch {
    await copyFile(filePath, fileName)
  }
}
