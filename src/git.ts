import { execSync } from 'child_process'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import { WARN_NOW_CHANGE } from './constant'
import { warn } from './utils'

export type TagType = 'p' | 'v'
const _tagMessage = 'pkgs update tag'
export function gitSyncSave (
  version: string,
  message = '',
) {
  execSync(`git commit -am '${message} v${version}'`, { stdio: 'inherit' })
  gitSyncTag(version)
}
export function gitSyncTag (
  version?: string,
) {
  execSync(
    `git tag -a v${version}-v-pkg -m '${version}'`,
    { stdio: 'inherit' },
  )
}
export function gitSyncPublishTag (
  tagMessage: string = _tagMessage,
) {
  execSync(
    `git tag -a sync${Date.now()}-p-pkg -m '${tagMessage}'`,
    { stdio: 'inherit' },
  )
}
export function gitDiffSave (
  nameAntVersionPackages: string[],
  message: string,
) {
  const packagesMessage = nameAntVersionPackages
    .reduce((total, text) => `${total}\n- ${text}`, '\n')
  execSync(
    `git commit -am '${message}${packagesMessage || _tagMessage}'`,
    { stdio: 'inherit' },
  )
  gitDiffTag('v')
}
export function gitDiffTag (
  type: TagType,
  packagesMessage = _tagMessage,
) {
  execSync(
    `git tag -a diff${Date.now()}-${type}-pkg -m '${packagesMessage}'`,
    { stdio: 'inherit' },
  )
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

export async function getChangeFiles (
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
