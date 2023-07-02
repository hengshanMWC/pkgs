import { commandPublish, commandVersion } from '../../../src'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
const prefix = 'publish-test'
export const cmd = 'publish'

export async function testPublish (dir: string, version: string) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion(undefined, git, version)
}
export async function testList (arrFile: string[], tag?: string, isTag?: Boolean) {
  const _tag = isTag ? tag : undefined
  const publishCmdList = await commandPublish({
    tag: _tag,
  })
  await publishListTest(arrFile, publishCmdList, tag)
}
export function publishListTest (fileNameList: string[], cmdList?: string[], tag?: string) {
  expect(cmdList).not.toBeUndefined()
  cmdList && cmdList.forEach((cmd, index) => {
    expect(cmd).toBe(`cd packages/${fileNameList[index]} && pnpm publish --access public${tag ? ` --tag ${tag}` : ''}`)
  })
}
