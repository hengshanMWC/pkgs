import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { Context } from './src'
import { cmdInit } from './src/cmd'
import { defaultOptions } from './src/defaultOptions'
import { getJSON, assign } from './src/utils'
import { cliVersion, cliSuccess } from './src/tips'
import { gitDiffTag } from './src/git'
import type { TagType } from './src/git'
import type { CMD } from './src'
import type { ExecuteCommandOptions } from './src/defaultOptions'
interface PkgsData {
  context: Context
}
export const pkgsData = {} as PkgsData
export async function createPkgsData () {
  const packageJson = (await getJSON(
    'pkgs.json',
  )) as Partial<ExecuteCommandOptions>
  pkgsData.context = await Context.create(
    assign(defaultOptions, packageJson),
  )
  return pkgsData.context
}
export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
  git: SimpleGit = simpleGit(),
  version?: string,
) {
  cliVersion(cmd)
  const packageJson = (await getJSON(
    'pkgs.json',
  )) as Partial<ExecuteCommandOptions>
  const context = await Context.create(
    assign(defaultOptions, packageJson, options),
    git,
  )
  if (cmd === 'version') {
    await context.cmdVersion(version)
  }
  else {
    await context.cmdPublish()
  }
  cliSuccess()
}
export async function executeCommandTag (
  cmd?: Partial<Record<TagType, boolean>>,
  git: SimpleGit = simpleGit(),
) {
  cliVersion('tag')
  if (!cmd || !Object.keys(cmd).length) {
    await gitDiffTag('version', undefined, git)
    await gitDiffTag('publish', undefined, git)
  }
  else {
    if (cmd.p) {
      await gitDiffTag('publish', undefined, git)
    }
    if (cmd.v) {
      await gitDiffTag('version', undefined, git)
    }
  }
  cliSuccess()
}
export async function executeCommandInit () {
  cliVersion('init')
  await cmdInit()
  cliSuccess()
}
export type RunMode = 'work' | 'stage' | 'repository'
export async function executeCommandRun (
  cmd: string,
  mode: RunMode = 'work',
  rootPackage?: boolean,
  git: SimpleGit = simpleGit(),
) {
  cliVersion('run')
  const packageJson = (await getJSON(
    'pkgs.json',
  )) as Partial<ExecuteCommandOptions>
  const context = await Context.create(
    assign(defaultOptions, packageJson, { rootPackage }),
    git,
  )
  await context.storeCommand[`${mode}Command`](cmd)
  cliSuccess()
}

// export async function pluginCommands (
//   cmd: any,
//   options: Partial<ExecuteCommandOptions> = {},
//   git: SimpleGit = simpleGit(),
// ) {
//   cliVersion(cmd)
//   const packageJson = (await getJSON(
//     'pkgs.json',
//   )) as Partial<ExecuteCommandOptions>
//   const context = await Context.create(
//     assign(defaultOptions, packageJson, options),
//     git,
//   )
//   const plugin = context.pluginStore.map.get(cmd)
//   if (plugin) {
//     plugin.action(context)
//   }
//   cliSuccess()
// }

export type { TagType } from './src/git'
export type { CMD } from './src'
export type { ExecuteCommandOptions } from './src/defaultOptions'
