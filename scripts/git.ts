import { execSync } from 'child_process'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
import type { ExecuteCommandOptions } from './defaultOptions'
import { versionNumberText } from './utils/regExp'
export type TagType = 'p' | 'v'
const _tagMessage = 'pkgs update tag'
export function gitSyncSave (
  version: string,
  message: string,
) {
  execSync(`git commit -am '${message}v${version}'`, { stdio: 'inherit' })
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
    .reduce((total, text) => `${total}\n- ${text}`, '\n')
  execSync(
    `git commit -am '${message}${packagesMessage || _tagMessage}'`,
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
  let modeCondition: string
  let modeNumber: string
  if (mode === 'sync') {
    modeCondition = 'v'
    modeNumber = versionNumberText
  }
  else {
    modeCondition = 'diff'
    modeNumber = '\\d+'
  }
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
    `^(${modeCondition}${modeNumber})(.+)?(-${type}$)`,
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
    console.warn('No new commit')
    process.exit()
  }
  return arr
}
