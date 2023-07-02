import { commandPublish, commandVersion } from '../../../src'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
const prefix = 'publish-test'
export const cmd = 'publish'

export async function testPublish (dir: string, arrFile: string[], version: string, tag?: string, isTag?: Boolean) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion(undefined, git, version)
  const publishCmdList = await commandPublish({
    tag: isTag ? tag : undefined,
  })
  publishListTest(arrFile, publishCmdList, tag)
  return git
}
function publishListTest (fileNameList: string[], cmdList?: string[], tag?: string) {
  expect(cmdList).not.toBeUndefined()
  cmdList && cmdList.forEach((cmd, index) => {
    expect(cmd).toBe(`cd packages/${fileNameList[index]} && pnpm publish --access public${tag ? ` --tag ${tag}` : ''}`)
  })
}
