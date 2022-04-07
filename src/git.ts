import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { WARN_NOW_CHANGE } from './constant'
import { warn } from './utils'

export type TagType = 'publish' | 'version' | string
const _tagMessage = 'pkgs update tag'
export async function gitSyncSave (
  version: string,
  message = '',
  git: SimpleGit = simpleGit(),
) {
  await git.commit(`${message} v${version}`)
  await gitSyncTag(version, git)
}
export async function gitSyncTag (
  version: string,
  git: SimpleGit = simpleGit(),
) {
  await git.tag([
    '-a',
    `v${version}-version-pkg`,
    '-m',
    version,
  ])
}
export async function gitSyncPublishTag (
  tagMessage: string = _tagMessage,
  git: SimpleGit = simpleGit(),
) {
  await git.tag([
    '-a',
    `sync${Date.now()}-publish-pkg`,
    '-m',
    tagMessage,
  ])
}
export async function gitDiffSave (
  nameAntVersionPackages: string[],
  message?: string,
  git: SimpleGit = simpleGit(),
) {
  const packagesMessage = nameAntVersionPackages
    .reduce((total, text) => `${total}\n- ${text}`, '\n')
  await git.commit(`${message || ''}${packagesMessage || _tagMessage}`)
  await gitDiffTag('version', message, git)
}
export async function gitTemporary (files: string | string[], git: SimpleGit = simpleGit()) {
  await git.add(files)
}
export async function gitDiffTag (
  type: TagType,
  packagesMessage = _tagMessage,
  git: SimpleGit = simpleGit(),
) {
  await git.tag([
    '-a',
    `diff${Date.now()}-${type}-pkg`,
    '-m',
    packagesMessage,
  ])
}
export async function getTag (
  type: TagType,
  git: SimpleGit = simpleGit(),
) {
  const tags = await git.tag([
    '-l',
    `*-${type}-pkg`,
    '-n',
    '--sort=taggerdate',
    '--format',
    '%(refname:short)',
  ])
  // 获取gittag
  const versionRegExp = new RegExp(
    `-${type}-pkg$`,
  )
  const tagArr = tags.trim().split('\n').reverse()
  return tagArr.find(item => versionRegExp.test(item))
}

export async function getNewestCommitId (git: SimpleGit = simpleGit()) {
  const newestCommitId = await git.raw([
    'rev-parse',
    'HEAD',
  ])
  return newestCommitId.replace('\n', '')
}

export async function getTagCommitId (
  tag: string,
  git: SimpleGit = simpleGit(),
) {
  const tagCommitInfo = await git.show([
    tag,
    '-s',
    '--format=%h',
  ])
  return tagCommitInfo.trim().split('\n').at(-1)
}

async function getChangeFiles (
  newestCommitId: string,
  tagCommitId: string,
  git: SimpleGit = simpleGit(),
) {
  const diffs = await git.diff([
    newestCommitId,
    tagCommitId,
    '--stat',
  ])
  const arr = diffs
    .trim()
    .split('\n')
    .map(item => item.split('|')[0].trim())

  arr.pop()

  if (!arr.length) {
    warn(WARN_NOW_CHANGE)
    process.exit()
  }
  return arr
}
export type DiffFile = string[] | boolean | undefined
export async function getRepositoryInfo (
  type: TagType, git: SimpleGit = simpleGit(),
): Promise<DiffFile> {
  const tag = await getTag(type, git)

  // 没有打过标记
  if (!tag) {
    return true
  }

  const tagCommitId = await getTagCommitId(tag, git)
  const newestCommitId = await getNewestCommitId(git)

  return getChangeFiles(newestCommitId, tagCommitId as string, git)
}
export async function getStageInfo (
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { staged } = await git.status()
  return staged
}

export async function getWorkInfo (
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { modified, staged } = await git.status()
  return modified.filter(item => !staged.includes(item))
}
