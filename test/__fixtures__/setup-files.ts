import { changePackagesFile, changeRootFile } from './constant'
import type { SimpleGitTestContext } from './create-test-context'

export async function setUpFilesAdded(
  { git, files }: SimpleGitTestContext,
  fileNames: string[],
  addSelector: string | string[] = '.',
  message = 'Create files',
) {
  await files(...fileNames)
  await git.add(addSelector)
  await git.commit(message)
}

export async function changePackagesFileGitCommit(context: SimpleGitTestContext) {
  try {
    await setUpFilesAdded(context, [changePackagesFile])
  }
  catch {
    // 根目录
    await setUpFilesAdded(context, [changeRootFile])
  }
}
