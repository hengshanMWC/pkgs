import type { CommandParams, Context } from '../../../src'
import { parseCommandRun, commandVersion } from '../../../src'
import type { Mode } from '../../../src/defaultOptions'
import { newVersion } from '../constant'
import { handleCommand } from '../create-test-context'
import { changePackagesFileGitCommit } from '../setup-files'

function getDirList (ctx: Context) {
  const { commandList } = ctx.getCommandResult()
  return commandList
}

export function createRun (names: string[]): CommandParams[] {
  return names.map(name => {
    return {
      args: ['run', 'test'],
      options: {
        cwd: name ? `packages/${name}` : '',
      },
    }
  })
}
export const cmd = 'run'

const prefix = `${cmd}-test`
export async function testMain (dir: string, arr: CommandParams[], arr2: CommandParams[], mode: Mode) {
  const context = await handleCommand(dir, prefix)
  const cmd = 'test'
  const testCmdList = (cmdList?: CommandParams[], list = arr) => {
    expect(cmdList).not.toBeUndefined()
    if (cmdList) {
      cmdList.forEach((commandParams, index) => {
        expect(commandParams.args).toEqual(list[index].args)
        expect(commandParams.options?.cwd).toBe(list[index].options?.cwd)
      })
    }
  }

  const ctxAll = await parseCommandRun(undefined, cmd, context.git)
  const cmdListAll = getDirList(ctxAll)
  testCmdList(cmdListAll)

  const ctxWork = await parseCommandRun({
    type: 'work',
  }, cmd, context.git)
  const cmdListWork = getDirList(ctxWork)
  testCmdList(cmdListWork)

  await context.git.add('.')
  const ctxStage = await parseCommandRun({
    type: 'stage',
  }, cmd, context.git)
  const cmdListStage = getDirList(ctxStage)
  testCmdList(cmdListStage)

  await context.git.commit('save')
  const ctxRepository = await parseCommandRun({
    type: 'repository',
    mode,
  }, cmd, context.git)
  const cmdListRepository = getDirList(ctxRepository)
  testCmdList(cmdListRepository)

  await commandVersion({
    mode,
  }, context.git, newVersion)

  await changePackagesFileGitCommit(context)
  await context.git.commit('save')
  const ctxRepository2 = await parseCommandRun({
    type: 'repository',
    mode,
  }, cmd, context.git)
  const cmdListRepository2 = getDirList(ctxRepository2)
  testCmdList(cmdListRepository2, arr2)
}
