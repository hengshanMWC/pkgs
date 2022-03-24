import { Context } from './scripts'
import type { CMD } from './scripts'
import type { ExecuteCommandOptions } from './scripts/defaultOptions'

export async function executeCommand (
  cmd: CMD,
  options?: Partial<ExecuteCommandOptions>,
) {
  const context = new Context(options)
  await context.initData()
  context.cmdAnalysis(cmd)
}
