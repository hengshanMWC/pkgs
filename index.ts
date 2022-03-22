import { Context } from './scripts'
import type { CMD } from './scripts'
export async function executeCommand (cmd: CMD, packagesPath?: string) {
  const context = new Context()
  await context.initData(packagesPath)
  context.cmdAnalysis(cmd)
}
