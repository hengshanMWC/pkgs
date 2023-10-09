import path from 'node:path'
import type { PluginData } from '../type'
import type { CopyFileExecuteCommandData } from '../../execute'
import { BaseExecuteManage, CopyFileExecuteTask, MkdirExecuteTask } from '../../execute'
import { createPkgsCommand } from '../../instruct'
import { Agent } from '../../constant'

export function parseCommandInit() {
  const packagesName = 'packages'
  const pkgsJsonName = `${Agent.PKGS}.config.js`
  const packageJsonName = 'package.json'
  const dirPath = path.resolve(__dirname, './template')
  const pkgsJson = path.resolve(dirPath, pkgsJsonName)
  const packageJson = path.resolve(dirPath, packageJsonName)
  return [
    new MkdirExecuteTask(createPkgsCommand(packagesName)),
    new CopyFileExecuteTask(createPkgsCommand(pkgsJsonName, {
      cwd: pkgsJson,
    }) as CopyFileExecuteCommandData),
    new CopyFileExecuteTask(createPkgsCommand(packageJsonName, {
      cwd: packageJson,
    }) as CopyFileExecuteCommandData),
  ]
}

export async function commandInit() {
  const executeManage = new BaseExecuteManage()
  const executeResult = await executeManage
    .pushTask(...parseCommandInit())
    .execute()
  return {
    executeResult,
  }
}

export function createInitPlugin(): PluginData {
  return {
    id: 'init',
    command: 'init',
    description: `create ${Agent.PKGS} file`,
    action: commandInit,
  }
}
