import type { Context } from '../../lib'

export async function getTagPublish (context: Context) {
  try {
    const result = await context.storeCommand.git.raw([
      'tag',
      '--sort',
      'v:refname',
      '|',
      'grep',
      '-v',
      '^v',
    ])
    return result.split('/n')[0]
  }
  catch {

  }
}
