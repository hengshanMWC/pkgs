import path from 'path'
import { writeFile } from 'fs-extra'
import { commandRun } from '../../src/index'
import type { SimpleGitTestContext } from '../__fixtures__'
import {
  handleCommand,
} from '../__fixtures__'
import { Interdependence, many, quarantine, single } from '../__fixtures__/constant'
const ORIGINAL_CWD = process.cwd()
const cmd = 'run'
const cmds = [
  'cd packages/a && npm run test',
  'cd packages/b && npm run test',
  'cd packages/c && npm run test',
  'cd packages/d && npm run test',
  'cd packages/e && npm run test',
]
const rootCmd = ['npm run test']
describe(cmd, () => {
  const prefix = `${cmd}-test`
  async function testMain (dir: string, arr: string[]) {
    const context = await handleCommand(dir, prefix)
    const cmd = 'test'
    const testCmds = (cmds?: string[]) => {
      if (cmds) {
        cmds.forEach((text, index) => {
          expect(text).toBe(arr[index])
        })
      }
    }
    const cmds1 = await commandRun(cmd, 'work', context.git)
    expect(cmds1).not.toBeUndefined()
    testCmds(cmds1)

    await context.git.add('.')
    const cmds2 = await commandRun(cmd, 'stage', context.git)
    expect(cmds2).not.toBeUndefined()
    testCmds(cmds2)

    await context.git.commit('save')
    const cmds3 = await commandRun(cmd, 'repository', context.git)
    expect(cmds3).not.toBeUndefined()
    testCmds(cmds3)
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  // 无依赖+rootPackage: false
  test(quarantine, async () => {
    await testMain(quarantine, [cmds[0], cmds[1]])
  })
  // 复杂依赖
  test(many, async () => {
    const _cmds: string[] = cmds.slice();
    [_cmds[2], _cmds[3], _cmds[4]] = [_cmds[3], _cmds[4], _cmds[2]]
    await testMain(many, _cmds)
  })
  // 依赖循环
  test(Interdependence, async () => {
    const _cmds: string[] = cmds.slice(0, 3).reverse()
    await testMain(Interdependence, _cmds)
  })
  // // 单项目
  // test(single, async () => {
  //   await testMain(single, rootCmd)
  // })
})
