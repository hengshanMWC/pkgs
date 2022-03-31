import { executeCommandTag } from '../../index'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
} from '../__fixtures__'
import { tagExpect, fillgit } from '../__fixtures__/commit'
const cmd = 'tag'
describe(cmd, () => {
  let context: SimpleGitTestContext

  beforeEach(async () => {
    context = await fillgit()
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
