import { GitExecuteTask } from '../../execute'
import { createGitCommand } from '../../instruct'
import type { Context } from '../../lib'

export async function getTagPublish(context: Context) {
  const task = new GitExecuteTask(createGitCommand(
    [
      'tag',
      '--sort',
      'v:refname',
      '|',
      'grep',
      '-v',
      '^v',
    ],
  ), context.fileStore.git)
  try {
    const result = await task.execute()
    return result.split('/n')[0]
  }
  catch {

  }
}
