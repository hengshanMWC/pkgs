import { Context } from './scripts'
import type { CMD } from './scripts'
import type { ExecuteCommandOptions } from './scripts/defaultOptions'
import { defaultOptions } from './scripts/defaultOptions'
import { readJSON, assign } from './scripts/utils'
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
