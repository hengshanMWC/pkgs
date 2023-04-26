import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { Context } from './lib/context'
import type { CMD } from './lib/context'
import type { ExecuteCommandOptions } from './defaultOptions'
import { commandVersion } from './command'

export * from './cli'
export * from './command'

export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
  git: SimpleGit = simpleGit(),
  version?: string,
) {
  if (cmd === 'version') {
    await commandVersion(options, version, git)
  }
  else {
    const config = await Context.assignConfig(options)
    const context = await Context.create(
      config,
      git,
    )
    await context.cmdPublish()
  }
}

export type { TagType } from './utils/git'
export type { CMD } from './lib/context'
export type { ExecuteCommandOptions } from './defaultOptions'
