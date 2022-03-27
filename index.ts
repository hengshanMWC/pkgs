import { Context } from './src'
import type { CMD } from './src'
import type { ExecuteCommandOptions } from './src/defaultOptions'
import { defaultOptions } from './src/defaultOptions'
import { readJSON, assign } from './src/utils'
import { gitDiffTag } from './src/git'
import type { TagType } from './src/git'
export async function executeCommand (
  cmd: CMD,
  options: Partial<ExecuteCommandOptions> = {},
) {
  const packageJson =
    await readJSON('pkgs.json') as Partial<ExecuteCommandOptions>
  const context = new Context(
    assign<ExecuteCommandOptions>(defaultOptions, packageJson, options),
  )
  await context.initData()
  context.cmdAnalysis(cmd)
}
export function executeCommandTag (type: TagType) {
  gitDiffTag(type)
}
