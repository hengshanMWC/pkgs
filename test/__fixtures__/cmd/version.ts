import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import { readJSON } from 'fs-extra'
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
  const tagCommitId = await tagExpect(`v${version}`, git) as string
  const newCommitId = await getNewestCommitId(git)
  expect(newCommitId.includes(tagCommitId)).toBeTruthy()
}

export async function syncTest (dir: string, newVersion: string, arr) {
  const message = 'chore: test'
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  const { analysisBlockList } = await commandVersion({
    message: `${message} %s`,
  }, git, newVersion)

  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(`@test/${arr[index]}`)
    expect(analysisBlock.packageJson.version).toBe(newVersion)
  })

  await syncVersionDiff(newVersion, git)
  // packages test
  const gitMessage = await getCommitMessage(git)
  expect(gitMessage).toBe(`${message} v${newVersion}`)
  return git
}

export async function testPackages (arrFile: string[], newVersion: string) {
  const arr = await getPackages(arrFile)
  arr.forEach(({ version }) => expect(version).toBe(newVersion))
}

export async function testPackage (filePath: string, newVersion: string) {
  const json = await readJSON(filePath)
  expect(json.version).toBe(newVersion)
}

export async function diffTest (dir: string, newVersion: string) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({
    mode: 'diff',
  }, git, newVersion)

  return {
    context,
    git,
  }
}

export async function diffTestPackageList (arrFile: string[], newVersion: string, git: SimpleGit) {
  const packageJsonList = await getPackages(arrFile)
  const tagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
  await tagList
}

export async function diffTestPackage (filePath: string, newVersion: string, git: SimpleGit) {
  const json = await readJSON(filePath)
  await tagCommit(json, newVersion, git)
}
