import { executeCommandTag } from '../../src/index'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
  setUpFilesAdded,
  createTestContext,
  setUpInit,
} from '../__fixtures__'
import { tagExpect } from '../__fixtures__/commit'
const cmd = 'tag'
describe(cmd, () => {
  let context: SimpleGitTestContext

  beforeEach(async () => {
    context = await createTestContext('git-test')
    await setUpInit(context)
    // 生成一个commit，防止gittag没commit而报错
    await setUpFilesAdded(context, ['tag'])
  })
  test('default', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag(undefined, git)
    await tagExpect('publish', git)
    await tagExpect('version', git)
  })
  test('version', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      v: true,
    }, git)
    await tagExpect('version', git)
  })

  test('publish', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      p: true,
    }, git)
    await tagExpect('publish', git)
  })

  test('all', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      v: true,
      p: true,
    }, git)
    await tagExpect('publish', git)
    await tagExpect('version', git)
  })
})
