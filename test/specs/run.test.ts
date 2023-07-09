import type { Mode } from '../../src/defaultOptions'
import { commandRun } from '../../src/index'
import {
  handleCommand,
} from '../__fixtures__'
import { Interdependence, many, quarantine, single } from '../__fixtures__/constant'
const ORIGINAL_CWD = process.cwd()
const cmd = 'run'
const cmdList = [
  'cd packages/a && pnpm run test',
  'cd packages/b && pnpm run test',
  'cd packages/c && pnpm run test',
  'cd packages/d && pnpm run test',
  'cd packages/e && pnpm run test',
]
const rootCmd = ['pnpm run test']
describe(cmd, () => {
  const prefix = `${cmd}-test`
  async function testMain (dir: string, arr: string[], mode: Mode) {
    const context = await handleCommand(dir, prefix)
    const cmd = 'test'
    const testCmdList = (cmdList?: string[]) => {
      if (cmdList) {
        cmdList.forEach((text, index) => {
          expect(text).toBe(arr[index])
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
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  // 无依赖+rootPackage: false
  test(quarantine, async () => {
    await testMain(quarantine, [cmdList[0], cmdList[1]], 'sync')
    await testMain(quarantine, [cmdList[0], cmdList[1]], 'diff')
  })
  // 复杂依赖
  test(many, async () => {
    const _cmdList: string[] = cmdList.slice();
    [_cmdList[2], _cmdList[3], _cmdList[4]] = [_cmdList[3], _cmdList[4], _cmdList[2]]
    await testMain(many, _cmdList, 'sync')
    await testMain(many, _cmdList, 'diff')
  })
  // 依赖循环
  test(Interdependence, async () => {
    const _cmdList: string[] = cmdList.slice(0, 3).reverse()
    await testMain(Interdependence, _cmdList, 'sync')
    await testMain(Interdependence, _cmdList, 'diff')
  })
  // 单项目
  test(single, async () => {
    await testMain(single, rootCmd, 'sync')
    await testMain(single, rootCmd, 'diff')
  })
})
