import type { CommandParams, CommandResult, Context } from '../../../src'
import { parseCommandRun, commandVersion } from '../../../src'
import type { Mode } from '../../../src/constant'
import { newVersion } from '../constant'
import { handleCommand } from '../create-test-context'
import { changePackagesFileGitCommit } from '../setup-files'
import { createPackagePath } from '../utils'

function getDirList (ctx: Context): CommandResult[] {
  return ctx.executeManage.getCommandData().commandData
}

export function createRun (names: string[]): CommandParams<string[]>[] {
  return names.map(name => {
    return {
      args: ['run', 'test'],
      options: {
        cwd: createPackagePath(name),
      },
    }
  })
}
export const cmd = 'run'

const prefix = `${cmd}-test`
export async function testMain (
  dir: string,
  arr: CommandParams<string[]>[],
  arr2: CommandParams<string[]>[],
  mode: Mode,
) {
  const context = await handleCommand(dir, prefix)
  const cmd = 'test'
  const testCmdList = (cmdList?: CommandParams<string[]>[], list = arr) => {
    expect(cmdList).not.toBeUndefined()
    if (cmdList) {
      cmdList.forEach((commandParams, index) => {
        expect(commandParams.args).toEqual(list[index].args)
        expect(commandParams.options?.cwd).toBe(list[index].options?.cwd)
      })
    }
  }

  const ctxAll = await parseCommandRun(cmd, undefined, context.git)
  const cmdListAll = getDirList(ctxAll)
  testCmdList(cmdListAll)

  const ctxWork = await parseCommandRun(cmd, {
    type: 'work',
  }, context.git)
  const cmdListWork = getDirList(ctxWork)
  testCmdList(cmdListWork)

  await context.git.add('.')
  const ctxStage = await parseCommandRun(cmd, {
    type: 'stage',
  }, context.git)
  const cmdListStage = getDirList(ctxStage)
  testCmdList(cmdListStage)

  await context.git.commit('save')
  const ctxRepository = await parseCommandRun(cmd, {
    type: 'repository',
    mode,
  }, context.git)
  const cmdListRepository = getDirList(ctxRepository)
  testCmdList(cmdListRepository)

  await commandVersion({
    mode,
  }, context.git, newVersion)

  await changePackagesFileGitCommit(context)
  await context.git.commit('save')
  const ctxRepository2 = await parseCommandRun(cmd, {
    type: 'repository',
    mode,
  }, context.git)
  const cmdListRepository2 = getDirList(ctxRepository2)
  testCmdList(cmdListRepository2, arr2)
}
