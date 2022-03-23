import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import simpleGit from 'simple-git'
import type { SimpleGit } from 'simple-git'
export type TagType = 'p' | 'v'
export function gitSave (version: IPackageJson['version']) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m 'chore: release v${version}'`, { stdio: 'inherit' })
  execSync(`git tag -a v${version} -m 'v${version}'`, { stdio: 'inherit' })
}

export async function getTag (type: TagType, git: SimpleGit = simpleGit()) {
  const tags = await git.tag([
    '-l',
    `v*-${type}`,
    '-n',
    '--sort=taggerdate',
    '--format',
    '%(refname:short)',
  ])
  // v1.0.0-p,-p证明是publish过的节点
  const versionRegExp = new RegExp(`^(v\\d+\\.\\d+\\.\\d+)(.+)?(-${type}$)`)
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
