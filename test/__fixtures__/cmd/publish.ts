import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import { readJSON } from 'fs-extra'
import { getPackages, tagExpect } from '../commit'
import { getNewestCommitId } from '../../../src/utils/git'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
import { commandPublish, commandVersion } from '../../../src'
const prefix = 'publish-test'
export const cmd = 'publish'

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

export async function syncVersionTest (dir: string, newVersion: string) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({}, git, newVersion)
  return git
}
export async function publishPackage (git: SimpleGit, arrFile: string[], newVersion: string) {
  const await commandPublish({}, git)
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
