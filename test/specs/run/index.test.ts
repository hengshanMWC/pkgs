import path from 'path'
import fs from 'fs-extra'
import { executeCommandRun } from '../../../index'
import type {
  SimpleGitTestContext,
} from '../../__fixtures__'
import {
  createTestContext,
  setUpInit,
} from '../../__fixtures__'
import testGlobal from '../../../src/utils/test'
const ORIGINAL_CWD = process.cwd()
const cmd = 'run'
const cmds = [
  'npm run test',
  'cd packages/a && npm run test',
  'cd packages/b && npm run test',
  'cd packages/c && npm run test',
  'cd packages/d && npm run test',
  'cd packages/e && npm run test',
]

describe(cmd, () => {
  let context: SimpleGitTestContext
  const prefix = `${cmd}-test`
  async function testMain (dir: string, arr: string[] = cmds) {
    await handleCommand(dir)
    await testRun(arr)
    const filePath = path.resolve(context._root, dir, 'packages/a/a')
    await fs.writeFile(filePath, context._root)
    await testRun(arr)
  }
  async function handleCommand (dir) {
    context = await createTestContext(prefix, dir)

    process.chdir(context._root)
    await fs.copy(path.resolve(__dirname, './template', dir), dir)

    process.chdir(path.resolve(context._root, dir))
    await setUpInit(context)
  }
  async function testRun (arr: string[] = cmds) {
    let i = 0
    testGlobal.pkgsTestPublish = text => {
      expect(text).toBe(arr[i++])
    }
    await executeCommandRun('test', 'work', context.git)

    i = 0
    await context.git.add('.')
    await executeCommandRun('test', 'stage', context.git)

    i = 0
    await context.git.commit('save')
    await executeCommandRun('test', 'repository', context.git)
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
    testGlobal.pkgsTestPublish = undefined
  })
  // 无依赖+rootPackage: false
  const quarantine = 'quarantine'
  test(quarantine, async () => {
    await testMain(quarantine, cmds.slice(1))
  })
  // 复杂依赖
  const many = 'many'
  test(many, async () => {
    const _cmds: string[] = cmds.slice();
    [_cmds[3], _cmds[4], _cmds[5]] = [_cmds[4], _cmds[5], _cmds[3]]
    await testMain(many, _cmds)
  })
  // 依赖循环
  const Interdependence = 'Interdependence'
  test(Interdependence, async () => {
    const _cmds: string[] = [cmds[0], ...cmds.slice(1, 4).reverse()]
    await testMain(Interdependence, _cmds)
  })
})
