import { Context } from './src'
import type { CMD } from './src'
import type { ExecuteCommandOptions } from './src/defaultOptions'
import { defaultOptions } from './src/defaultOptions'
import { readJSON, assign } from './src/utils'
import { cliVersion, cliSuccess } from './src/tips'
import { gitDiffTag } from './src/git'
import type { TagType } from './src/git'
export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
) {
  cliVersion(cmd)
  const packageJson =
    await readJSON('pkgs.json') as Partial<ExecuteCommandOptions>
  const context = new Context(
    assign<ExecuteCommandOptions>(defaultOptions, packageJson, options),
  )
  await context.initData()
  await context.cmdAnalysis(cmd)
  cliSuccess()
}
export function executeCommandTag (
  cmd: Partial<Record<TagType, boolean>>,
) {
  cliVersion('tag')
  if (!Object.keys(cmd).length) {
    gitDiffTag('v')
    gitDiffTag('p')
  }
  else {
    if (cmd.p) {
      gitDiffTag('p')
    }
    if (cmd.v) {
      gitDiffTag('v')
    }
  }
  cliSuccess()
}
