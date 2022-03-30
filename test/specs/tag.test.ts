// import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { executeCommandTag } from '../../index'
import type { TagType } from '../../index'
import {
  getTag,
  getTagCommitId,
} from '../../src/git'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  createTestContext,
  newSimpleGit,
  setUpInit,
  setUpFilesAdded,
} from '../__fixtures__'
const cmd = 'tag'
async function tagExpect (type: TagType, git: SimpleGit) {
  const tag = await getTag(type, git)
  const tagCommitId = await getTagCommitId(tag, git)
  expect(tagCommitId).not.toBeUndefined()
}
describe(cmd, () => {
  let context: SimpleGitTestContext

  beforeEach(async () => {
    context = await createTestContext()
    await setUpInit(context)
    await context.file(['clean-dir', 'clean'])
    await context.file(['dirty-dir', 'dirty'])
    await setUpFilesAdded(context, ['alpha', 'beta'], ['alpha', 'beta', './clean-dir'])
  })
  test('default', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag(undefined, git)
    await tagExpect('p', git)
    await tagExpect('v', git)
  })
  test('version', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      v: true,
    }, git)
    await tagExpect('v', git)
  })

  test('publish', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      p: true,
    }, git)
    await tagExpect('p', git)
  })

  test('all', async () => {
    const git = newSimpleGit(context.root)
    await executeCommandTag({
      v: true,
      p: true,
    }, git)
    await tagExpect('p', git)
    await tagExpect('v', git)
  })
})
