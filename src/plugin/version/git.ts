import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import { gitCommitMessageFormat } from '../../utils'
import { getVersionTag, gitTag } from '../../utils/git'
import type { Context } from '../../lib'

export async function gitSyncSave(
  version: string,
  message = '',
  tagMessage = '',
  git: SimpleGit = simpleGit(),
) {
  await git.commit(gitCommitMessageFormat(message, version))
  await gitTag(version, tagMessage, git)
}

export async function getTagVersion(context: Context, separator = '') {
  const versionTag = await getVersionTag(`${separator}*`, context.fileStore.git)
  if (versionTag)
    return versionTag.slice(1)
}
