import path from 'path'
import type { SimpleGit } from 'simple-git'
import type { TagType } from '../../index'
import {
  getTag,
  getTagCommitId,
} from '../../src/git'
import {
  createTestContext,
  setUpInit,
  setUpFilesAdded,
  io,
} from '.'
export async function tagExpect (type: TagType, git: SimpleGit) {
  const tag = await getTag(type, git)
  const tagCommitId = await getTagCommitId(tag, git)
  expect(tagCommitId).not.toBeUndefined()
  return tagCommitId
}
export async function fillgit () {
  const context = await createTestContext()
  await setUpInit(context)
  await context.file(['clean-dir', 'clean'])
  await context.file(['dirty-dir', 'dirty'])
  await setUpFilesAdded(context, ['alpha', 'beta'], ['alpha', 'beta', './clean-dir'])
  return context
}
export async function createJson (prefix: string, content: string | any) {
  if (typeof content === 'object') {
    content = JSON.stringify(content, null, 2)
  }
  const _path = await io.mkdtemp(prefix)
  io.writeFile(path.join(_path, 'package.json'), content)
  return _path
}
