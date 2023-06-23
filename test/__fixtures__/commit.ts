import path from 'path'
import type { SimpleGit } from 'simple-git'
import {
  getVersionTag,
  getTagCommitId,
} from '../../src/utils/git'
import {
  io,
} from '.'
export async function tagExpect (version: string, git: SimpleGit) {
  const tag = await getVersionTag(version, git) as string
  expect(tag).not.toBeUndefined()
  const tagCommitId = await getTagCommitId(tag, git)
  expect(tagCommitId).not.toBeUndefined()
  return tagCommitId
}
export async function createJson (prefix: string, content: string | any) {
  if (typeof content === 'object') {
    content = JSON.stringify(content, null, 2)
  }
  const _path = await io.mkdtemp(prefix)
  io.writeFile(path.join(_path, 'package.json'), content)
  return _path
}
