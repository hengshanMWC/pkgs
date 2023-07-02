import { commandPublish, commandVersion } from '../../../src'
import { newVersion } from '../constant'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
const prefix = 'publish-test'
export const cmd = 'publish'

export async function syncTest (dir: string, arrFile: string[]) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion(undefined, git, newVersion)
  const publishCmdList = await commandPublish({
    publish: {
      tag: 'test',
    },
  })
  publishListTest(arrFile, publishCmdList)
  return git
}
function publishListTest (fileNameList: string[], cmdList?: string[]) {
  expect(cmdList).not.toBeUndefined()
  cmdList && cmdList.forEach((cmd, index) => {
    expect(cmd).toBe(`cd packages/${fileNameList[index]} && pnpm publish --access public`)
  })
}
