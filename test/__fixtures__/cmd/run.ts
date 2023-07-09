import { commandRun, commandVersion } from '../../../src'
import type { Mode } from '../../../src/defaultOptions'
import { newVersion } from '../constant'
import { handleCommand } from '../create-test-context'
import { changePackagesFileGitCommit } from '../setup-files'

export function createRun (names: string[]) {
  return names.map(name => `${name ? `cd packages/${name} && ` : ''}pnpm run test`)
}
export const cmd = 'run'

const prefix = `${cmd}-test`
export async function testMain (dir: string, arr: string[], arr2: string[], mode: Mode) {
  const context = await handleCommand(dir, prefix)
  const cmd = 'test'
  const testCmdList = (cmdList?: string[], list = arr) => {
    if (cmdList) {
      cmdList.forEach((text, index) => {
        expect(text).toBe(list[index])
      })
    }
  }

  const cmdListAll = await commandRun(undefined, cmd, context.git)
  expect(cmdListAll).not.toBeUndefined()
  testCmdList(cmdListAll)

  const cmdListWork = await commandRun({
    type: 'work',
  }, cmd, context.git)
  expect(cmdListWork).not.toBeUndefined()
  testCmdList(cmdListWork)

  await context.git.add('.')
  const cmdListStage = await commandRun({
    type: 'stage',
  }, cmd, context.git)
  expect(cmdListStage).not.toBeUndefined()
  testCmdList(cmdListStage)

  await context.git.commit('save')
  const cmdListRepository = await commandRun({
    type: 'repository',
    mode,
  }, cmd, context.git)
  expect(cmdListRepository).not.toBeUndefined()
  testCmdList(cmdListRepository)

  await commandVersion({
    mode,
  }, context.git, newVersion)

  await changePackagesFileGitCommit(context)
  await context.git.commit('save')
  const cmdListRepository2 = await commandRun({
    type: 'repository',
    mode,
  }, cmd, context.git)
  expect(cmdListRepository2).not.toBeUndefined()
  testCmdList(cmdListRepository2, arr2)
}
