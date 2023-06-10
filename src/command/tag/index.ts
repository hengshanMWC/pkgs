import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type { TagType } from '../../utils/git'
import { gitDiffTag } from '../../utils/git'
import type { PluginData } from '../../defaultOptions'

type CommandTagType = Partial<Record<TagType, boolean>>
export async function commandTag (
  cmd?: CommandTagType,
  git: SimpleGit = simpleGit(),
) {
  if (!cmd || !Object.keys(cmd).length) {
    await gitDiffTag('version', undefined, git)
    await gitDiffTag('publish', undefined, git)
  }
  else {
    if (cmd.p) {
      await gitDiffTag('publish', undefined, git)
    }
    if (cmd.v) {
      await gitDiffTag('version', undefined, git)
    }
  }
}

export function createTagPlugin (): PluginData {
  return {
    id: 'tag',
    command: 'tag',
    description: 'pkgs tag, diff mode: Compare according to tag',
    option: [
      ['-p', 'publish tag'],
      ['-v', 'version tag'],
    ],
    action: (context, cmd?: CommandTagType) => {
      return commandTag(cmd)
    },
  }
}
