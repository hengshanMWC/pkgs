import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { program } from 'commander'
import pkg from './package.json'
import { Context } from './src/context'
import { cmdInit } from './src/command'
import { cliVersion, cliSuccess } from './src/tips'
import { gitDiffTag } from './src/git'
import type { TagType } from './src/git'
import type { CMD } from './src/context'
import type { ExecuteCommandOptions } from './src/defaultOptions'
import { PluginStore } from './src/plugin'

export async function cliMain (argv: NodeJS.Process['argv']) {
  const pluginStore = new PluginStore()
  const config = await Context.assignConfig()
  pluginStore.use(...config.plugin)
  program
    .version(pkg.version)
    .description('Simple monorepo combined with pnpm')
  pluginStore.map.forEach(value => {
    let _program = program
      .command(value.id)
      .description(value.description)
      .action(async (...args) => {
        cliVersion(value.id)
        const context = await Context.create()
        await value.action(context, ...args)
        cliSuccess()
      })
    if (value.option) {
      value.option.forEach(item => {
        _program = _program.option(...item)
      })
    }
  })
  program.parse(argv)
}
export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
  git: SimpleGit = simpleGit(),
  version?: string,
) {
  const config = await Context.assignConfig(options)
  const context = await Context.create(
    config,
    git,
  )
  if (cmd === 'version') {
    await context.cmdVersion(version)
  }
  else {
    await context.cmdPublish()
  }
}
export async function executeCommandTag (
  cmd?: Partial<Record<TagType, boolean>>,
  git: SimpleGit = simpleGit(),
) {
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
}
export async function executeCommandInit () {
  await cmdInit()
}
export type RunMode = 'work' | 'stage' | 'repository'
export async function executeCommandRun (
  cmd: string,
  mode: RunMode = 'work',
  rootPackage?: boolean,
  git: SimpleGit = simpleGit(),
) {
  const config = await Context.assignConfig({
    rootPackage,
  })
  const context = await Context.create(
    config,
    git,
  )
  await context.storeCommand[`${mode}Command`](cmd)
}

export type { TagType } from './src/git'
export type { CMD } from './src/context'
export type { ExecuteCommandOptions } from './src/defaultOptions'
