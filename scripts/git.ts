import { execSync } from 'child_process'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import type { ExecuteCommandOptions } from './defaultOptions'
export type TagType = 'p' | 'v'
const _tagMessage = 'pkgs update tag'
export function gitSyncSave (
  version: string,
  message: string,
) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m '${message}v${version}'`, { stdio: 'inherit' })
  gitSyncTag('v', version)
}
export function gitSyncTag (
  type: TagType,
  version: string,
) {
  const tagMessage = version ? `v${version}` : _tagMessage
  execSync(
    `git tag -a v${version}-${type} -m ${tagMessage}`,
    { stdio: 'inherit' },
  )
}
export function gitDiffSave (
  nameAntVersionPackages: string[],
  message: string,
) {
  const packagesMessage = nameAntVersionPackages
    .reduce((total, text) => `${total}\n-${text}`, '\n')
  // execSync('git add .', { stdio: 'inherit' })
  execSync(
    `git commit -m '${message}${packagesMessage || _tagMessage}'`,
    { stdio: 'inherit' },
  )
  gitDiffTag('v', packagesMessage)
}
export function gitDiffTag (
  type: TagType,
  packagesMessage = _tagMessage,
) {
  execSync(
    `git tag -a diff${Date.now()}-${type} -m '${packagesMessage}'`,
    { stdio: 'inherit' },
  )
}
export async function getTag (
  type: TagType,
  mode: ExecuteCommandOptions['mode'],
  git: SimpleGit = simpleGit(),
) {
  const modeCondition = mode === 'sync' ? 'v' : 'diff'
  const tags = await git.tag([
    '-l',
    `${modeCondition}*-${type}`,
    '-n',
    '--sort=taggerdate',
    '--format',
    '%(refname:short)',
  ])
  // 获取gittag
  const versionRegExp = new RegExp(
    `^(${modeCondition}\\d+\\.\\d+\\.\\d+)(.+)?(-${type}$)`,
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
  return arr
}
