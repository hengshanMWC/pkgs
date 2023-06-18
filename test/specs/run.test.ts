import path from 'path'
import { writeFile, copy } from 'fs-extra'
import { commandRun } from '../../src/index'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  createTestContext,
  setUpInit,
} from '../__fixtures__'
import { getTag } from '../../src/utils/git'
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
  async function testMain (dir: string, arr: string[], arr2: string[]) {
    await handleCommand(dir)
    await testRun(arr)
    const filePath = path.resolve(context._root, dir, 'packages/a/a')
    await writeFile(filePath, context._root)
    await testRun(arr2, false)
  }
  async function handleCommand (dir) {
    context = await createTestContext(prefix, dir)

    process.chdir(context._root)
    await copy(path.resolve(__dirname, '../template', dir), dir)

    process.chdir(path.resolve(context._root, dir))
    await setUpInit(context)
  }
  async function testRun (arr: string[] = cmds, rootPackage?: boolean) {
    const cmd = 'test'
    const testCmds = (cmds?: string[]) => {
      if (cmds) {
        cmds.forEach((text, index) => {
          expect(text).toBe(arr[index])
        })
      }
    }
    const cmds1 = await commandRun(cmd, 'work', rootPackage, context.git)
    expect(cmds1).not.toBeUndefined()
    testCmds(cmds1)

    await context.git.add('.')
    const cmds2 = await commandRun(cmd, 'stage', rootPackage, context.git)
    expect(cmds2).not.toBeUndefined()
    testCmds(cmds2)

    await context.git.commit('save')
    const cmds3 = await commandRun(cmd, 'repository', rootPackage, context.git)
    expect(cmds3).not.toBeUndefined()
    testCmds(cmds3)

    const tag = await getTag(cmd)
    expect(tag && tag.includes(cmd)).toBeTruthy()
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  // 无依赖+rootPackage: false
  const quarantine = 'quarantine'
  test(quarantine, async () => {
    const _cmds = cmds.slice()
    await testMain(quarantine, _cmds, _cmds.slice(1))
  })
  // 复杂依赖
  const many = 'many'
  test(many, async () => {
    const _cmds: string[] = cmds.slice();
    [_cmds[3], _cmds[4], _cmds[5]] = [_cmds[4], _cmds[5], _cmds[3]]
    await testMain(many, _cmds, _cmds.slice(1))
  }, 1000000)
  // 依赖循环
  const Interdependence = 'Interdependence'
  test(Interdependence, async () => {
    const _cmds: string[] = [cmds[0], ...cmds.slice(1, 4).reverse()]
    await testMain(Interdependence, _cmds, _cmds.slice(1))
  })
})
