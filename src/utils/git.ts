import { simpleGit } from 'simple-git'
import type { FileStatusResult, SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import { GitExecuteTask } from '../execute'
import { createGitCommand } from '../instruct'
import { Agent } from '../constant'
import { getPackageNameVersion, getPackageNameVersionList } from './packageJson'
import { gitCommitMessageFormat, sortFilesName } from './index'

export type TagType = 'publish' | 'version' | string
const _tagMessage = `${Agent.PKGS} update tag`
export function getDiffCommitMessage(nameAntVersionPackages: string[]) {
  return nameAntVersionPackages.reduce(
    (total, text) => `${total}\n- ${text}`,
    '\n',
  )
}

export function getCommitPackageListMessage(
  packageJsonList: IPackageJson[],
  separator = '',
  message = '',
) {
  const nameAntVersionPackages = getPackageNameVersionList(packageJsonList, separator)
  const packagesMessage = getDiffCommitMessage(nameAntVersionPackages)
  return gitCommitMessageFormat(message, packagesMessage || _tagMessage)
}

export function getDiffTagArgs(
  packageJson: IPackageJson,
  separator = '',
  packagesMessage?: string,
) {
  const nameAntVersionPackages = getPackageNameVersion(packageJson, separator)
  return getGitTag(nameAntVersionPackages, packagesMessage)
}

export function getGitTag(
  version: string,
  packagesMessage = _tagMessage,
) {
  return ['tag', '-a', version, '-m', packagesMessage]
}

export async function getVersionTag(version: string, git: SimpleGit = simpleGit()) {
  try {
    const result = await git.raw([
      'describe',
      '--tags',
      '--match',
      version,
      '--abbrev=0',
    ])
    return result.replace(/\n$/, '')
  }
  catch {

  }
}
export async function gitTag(
  version: string,
  packagesMessage = _tagMessage,
  git: SimpleGit = simpleGit(),
) {
  await git.tag(['-a', version, '-m', packagesMessage])
}

export async function getNewestCommitId(git: SimpleGit = simpleGit()) {
  const newestCommitId = await git.raw(['rev-parse', 'HEAD'])
  return newestCommitId.replace('\n', '')
}

export async function getTagCommitId(
  tag: string,
  git: SimpleGit = simpleGit(),
) {
  const tagCommitInfo = await git.show([tag, '-s', '--format=%h'])
  const tagCommitInfoRows = tagCommitInfo.trim().split('\n')
  return tagCommitInfoRows.at(-1)
}

async function getChangeFiles(
  newestCommitId: string,
  tagCommitId: string,
  git: SimpleGit = simpleGit(),
) {
  const diffs = await git.diff([newestCommitId, tagCommitId, '--stat'])
  const arr = diffs
    .trim()
    .split('\n')
    .map(item => item.split('|')[0].trim())

  arr.pop()

  return arr
}
export type DiffFile = string[] | boolean | undefined
export async function getVersionDiffFile(
  version: string,
  git: SimpleGit = simpleGit(),
): Promise<DiffFile> {
  const versionTag = await getVersionTag(version)
  if (!versionTag)
    return true

  const result = await getCommitDiffFile(versionTag, git)
  return result
}
export async function getCommitDiffFile(tag: string, git: SimpleGit = simpleGit()): Promise<string[]> {
  if (!tag)
    return []

  const tagCommitId = await getTagCommitId(tag, git)
  const newestCommitId = await getNewestCommitId(git)

  if (tagCommitId)
    return getChangeFiles(newestCommitId, tagCommitId, git)

  else
    return []
}

export async function getStageInfo(
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { files } = await git.status()
  return sortFilter(files.filter(file => file.index))
}

export async function getWorkInfo(
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { files } = await git.status()
  return sortFilter(files.filter(file => file.working_dir))
}

function sortFilter(files: FileStatusResult[]) {
  return sortFilesName(files.map(file => file.path))
}

export async function getGitRemoteList(git: SimpleGit = simpleGit()) {
  const gitExecuteTask = new GitExecuteTask(createGitCommand(['remote']), git)
  try {
    const removes = await gitExecuteTask.execute()
    return removes ? removes.trim().split('\n') : []
  }
  catch {
    return []
  }
}
