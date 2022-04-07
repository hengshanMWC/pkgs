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

export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
  git: SimpleGit = simpleGit(),
  version?: string,
) {
  cliVersion(cmd)
  const packageJson =
    await getJSON('pkgs.json') as Partial<ExecuteCommandOptions>
  await Context.create(
    assign<ExecuteCommandOptions>(defaultOptions, packageJson, options),
    cmd,
    git,
    version,
  )
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
export async function executeCommandRun (cmd: string, mode: RunMode = 'work', git: SimpleGit = simpleGit()) {
  cliVersion('run')
  const context = await Context.create(
    defaultOptions,
    undefined,
    git,
  )
  await context[`${mode}Command`](cmd)
  cliSuccess()
}

export type { TagType } from './src/git'
export type { CMD } from './src'
export type { ExecuteCommandOptions } from './src/defaultOptions'
