import type { IPackageJson } from '@ts-type/package-dts'
import type { CommandResult } from './plugin'
import { Agent, DEFAULT_AGENT } from './constant'
import { mixinDefaultOptions } from './utils'
import { getDiffTagArgs, getGitTag } from './utils/git'
import { getPackageNameVersionStr, getPackageVersionTag } from './utils/packageJson'

export function createCommand(
  agent: CommandResult['agent'],
  args: CommandResult['args'] = [],
  options?: CommandResult['options'],
): CommandResult {
  return {
    agent,
    args,
    options: mixinDefaultOptions(options),
  }
}

export function createPkgsCommand(args?: string[] | string, options?: CommandResult['options']): CommandResult {
  return createCommand(Agent.PKGS, !Array.isArray(args) && args ? [args] : (args as string[]), options)
}

export function createGitCommand(args?: CommandResult['args']): CommandResult {
  return createCommand(Agent.GIT, args)
}

export function createPublishCommand(version: string, commandData: Partial<CommandResult>): CommandResult {
  const args = ['publish', ...(commandData.args ?? [])]
  const argTag = '--tag'
  if (args.every(arg => arg !== argTag)) {
    const tag = getPackageVersionTag(version)
    if (tag)
      args.push(argTag, tag)
  }
  return createCommand(commandData.agent ?? DEFAULT_AGENT, args, commandData.options)
}

interface createGitTagPackageListCommandType {
  version: string
  packageJsonList: IPackageJson<any>[]
  separator?: string
}

export function createGitTagPackageListCommand(
  {
    version,
    packageJsonList,
    separator = '',
  }: createGitTagPackageListCommandType,
) {
  return createGitCommand(
    getGitTag(
      separator + version,
      getPackageNameVersionStr(
        packageJsonList,
        separator,
      ),
    ),
  )
}

interface createGitTagPackageCommandType {
  packageJson: IPackageJson<any>
  separator?: string
}

export function createGitTagPackageCommand(
  {
    packageJson,
    separator,
  }: createGitTagPackageCommandType,
) {
  return createGitCommand(
    getDiffTagArgs(
      packageJson,
      separator,
    ),
  )
}

export function createGitAddCommand(filePath: string[]) {
  return createGitCommand(['add', ...filePath])
}

export function createGitCommitCommand(message: string) {
  return createGitCommand(['commit', '-m', message])
}

export function createGitPushCommand(args: string[]) {
  return createGitCommand(['push', ...args])
}

export function createGitPushTagsCommand(args?: string[]) {
  return createGitPushCommand([...(args ?? []), '--tags'])
}
