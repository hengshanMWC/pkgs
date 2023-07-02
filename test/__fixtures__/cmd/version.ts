import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import { getPackages, tagExpect } from '../commit'
import { getNewestCommitId } from '../../../src/utils/git'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
import { commandVersion } from '../../../src'
const prefix = 'version-test'
export const cmd = 'version'

export async function tagCommit (packageJson: IPackageJson, version, git: SimpleGit) {
  expect(packageJson.version).toBe(version)
  const tagCommitId = await tagExpect(`${packageJson.name}@${version}`, git)
  expect(tagCommitId).not.toBeUndefined()
}
async function getCommitMessage (git: SimpleGit) {
  const newCommitId = await getNewestCommitId(git)
  const gitMessage = await git.log([
    '-1',
    '--format=%B',
    newCommitId,
  ])
  return gitMessage.latest?.hash
}
async function syncVersionDiff (version: string, git: SimpleGit) {
  const tagCommitId = await tagExpect(`v${version}`, git)
  const newCommitId = await getNewestCommitId(git)
  expect(newCommitId.includes(tagCommitId)).toBeTruthy()
}

export async function syncTest (dir: string, arrFile: string[], newVersion: string) {
  const message = 'chore: test'
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({
    message: `${message} %s`,
  }, git, newVersion)

  // packages test
  const arr = await getPackages(arrFile)
  await syncVersionDiff(newVersion, git)
  arr.forEach(({ version }) => expect(version).toBe(newVersion))
  const gitMessage = await getCommitMessage(git)
  expect(gitMessage).toBe(`${message} v${newVersion}`)
  return git
}
export async function diffTest (dir: string, arrFile: string[], newVersion: string) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({
    mode: 'diff',
  }, git, newVersion)
  const packageJsonList = await getPackages(arrFile)
  const tagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
  await tagList
  return {
    context,
    git,
  }
}
