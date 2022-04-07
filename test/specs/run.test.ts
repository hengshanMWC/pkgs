import path from 'path'
import fs from 'fs-extra'
import { executeCommandRun } from '../../index'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  createTestContext,
  setUpInit,
} from '../__fixtures__'
const ORIGINAL_CWD = process.cwd()
const cmd = 'run'
describe.skip(cmd, () => {
  let context: SimpleGitTestContext
  const prefix = `${cmd}-test`
  async function handleCommand (dir = 'test') {
    context = await createTestContext(prefix, dir)

    process.chdir(context._root)
    await fs.copy(path.resolve(__dirname, '../../examples', dir), dir)
    await setUpInit(context)
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    await handleCommand()
    await executeCommandRun('test')
  })
  test('work', async () => {
    await executeCommandRun('test', 'work')
  })
  test('stage', async () => {
    await executeCommandRun('test', 'stage')
  })
  test('repository', async () => {
    await executeCommandRun('test', 'repository')
  })
})
