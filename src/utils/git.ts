import simpleGit from 'simple-git'
import type { SimpleGit, FileStatusResult } from 'simple-git'
import type IPackageJson from '@ts-type/package-dts'
import { WARN_NOW_CHANGE } from '../constant'
import type { Context } from '../lib'
import { gitCommitMessageFormat, sortFilesName, warn } from './index'

export type TagType = 'publish' | 'version' | string
const _tagMessage = 'pkgs update tag'
export async function gitSyncSave (
  version: string,
  message = '',
  git: SimpleGit = simpleGit(),
) {
  await git.commit(gitCommitMessageFormat(message, `v${version}`))
  await gitTag(`v${version}`, _tagMessage, git)
}
export async function gitDiffSave (
  packageJsonList: IPackageJson[],
  message = '',
  git: SimpleGit = simpleGit(),
) {
  const nameAntVersionPackages = packageJsonList.map(({ packageJson }) => {
    return `${packageJson.name as string}@${packageJson.version}`
  })
  const packagesMessage = nameAntVersionPackages.reduce(
    (total, text) => `${total}\n- ${text}`,
    '\n',
  )
  await git.commit(gitCommitMessageFormat(message, packagesMessage || _tagMessage))
  const tagList = nameAntVersionPackages.map(version => gitTag(version, message))
  await Promise.all(tagList)
}
export async function gitTemporary (
  files: string | string[],
  git: SimpleGit = simpleGit(),
) {
  await git.add(files)
}
export async function gitTag (
  version: string,
  packagesMessage = _tagMessage,
  git: SimpleGit = simpleGit(),
) {
  await git.tag(['-a', version, '-m', packagesMessage])
}
export async function getVersionTag (version: string, git: SimpleGit = simpleGit()) {
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

export async function getNewestCommitId (git: SimpleGit = simpleGit()) {
  const newestCommitId = await git.raw(['rev-parse', 'HEAD'])
  return newestCommitId.replace('\n', '')
}

export async function getTagCommitId (
  tag: string,
  git: SimpleGit = simpleGit(),
) {
  const tagCommitInfo = await git.show([tag, '-s', '--format=%h'])
  const tagCommitInfoRows = tagCommitInfo.trim().split('\n')
  return tagCommitInfoRows.at(-1)
}

async function getChangeFiles (
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

  if (!arr.length) {
    warn(WARN_NOW_CHANGE)
    process.exit()
  }
  return arr
}
export type DiffFile = string[] | boolean | undefined
export async function getVersionDiffFile (
  version: string,
  git: SimpleGit = simpleGit(),
): Promise<DiffFile> {
  const versionTag = await getVersionTag(version)
  if (!versionTag) {
    return true
  }
  const result = await getCommitDiffFile(versionTag, git)
  return result
}
export async function getCommitDiffFile (tag: string, git: SimpleGit = simpleGit()): Promise<string[]> {
  if (!tag) {
    return []
  }
  const tagCommitId = await getTagCommitId(tag, git)
  const newestCommitId = await getNewestCommitId(git)

  return getChangeFiles(newestCommitId, tagCommitId as string, git)
}

export async function getStageInfo (
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { files } = await git.status()
  return sortFilter(files.filter(file => file.index))
}

export async function getWorkInfo (
  git: SimpleGit = simpleGit(),
): Promise<string[]> {
  const { files } = await git.status()
  return sortFilter(files.filter(file => file.working_dir))
}

function sortFilter (files: FileStatusResult[]) {
  return sortFilesName(files.map(file => file.path))
}

export async function getTagVersion (context: Context) {
  const versionTag = await getVersionTag('v*', context.storeCommand.git)
  if (versionTag) {
    return versionTag.slice(1)
  }
}
