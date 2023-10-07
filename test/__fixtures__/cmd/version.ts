import type { IPackageJson } from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import { readJSON } from 'fs-extra'
import { getPackages, tagExpect } from '../commit'
import { getDiffCommitMessage, getNewestCommitId } from '../../../src/utils/git'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
import { commandVersion } from '../../../src'
import { getPackageNameVersion } from '../../../src/utils/packageJson'
import { Mode } from '../../../src/constant'

const prefix = 'version-test'
export const cmd = 'version'
export function createName(name: string) {
  return `@test/${name}`
}
export async function tagCommit(packageJson: IPackageJson, version, git: SimpleGit) {
  expect(packageJson.version).toBe(version)
  const tagCommitId = await tagExpect(`${packageJson.name}@v${version}`, git)
  expect(tagCommitId).not.toBeUndefined()
}
async function getCommitMessage(git: SimpleGit) {
  const newCommitId = await getNewestCommitId(git)
  const gitMessage = await git.log([
    '-1',
    '--format=%B',
    newCommitId,
  ])
  return gitMessage.latest?.hash
}
async function versionDiff(tag: string, git: SimpleGit) {
  const tagCommitId = await tagExpect(tag, git) as string
  const newCommitId = await getNewestCommitId(git)
  expect(newCommitId.includes(tagCommitId)).toBeTruthy()
}

export async function createGit(dir: string) {
  const context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  return {
    git,
    context,
  }
}

export async function syncTest(newVersion: string, arr: string[], git: SimpleGit) {
  const message = `chore: ${Mode.SYNC}`
  const { analysisBlockList } = await commandVersion({
    message: `${message} %s`,
  }, git, newVersion)

  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
    expect(analysisBlock.packageJson.version).toBe(newVersion)
  })

  await versionDiff(`v${newVersion}`, git)
  // packages test
  const gitMessage = await getCommitMessage(git)
  expect(gitMessage).toBe(`${message} v${newVersion}`)
}

export async function testPackages(arrFile: string[], newVersion: string) {
  const arr = await getPackages(arrFile)
  arr.forEach(({ version }) => expect(version).toBe(newVersion))
}

export async function testPackage(filePath: string, newVersion: string) {
  const json = await readJSON(filePath)
  expect(json.version).toBe(newVersion)
}

export async function diffTest(newVersion: string, arr: string[], git: SimpleGit) {
  const message = `chore: ${Mode.DIFF}`
  const { analysisBlockList } = await commandVersion({
    mode: Mode.DIFF,
    message: `${message} %s`,
  }, git, newVersion)

  const nameAntVersionPackages = analysisBlockList.map((analysisBlock, index) => {
    const packageJson = analysisBlock.packageJson
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
    expect(analysisBlock.packageJson.version).toBe(newVersion)
    return getPackageNameVersion(packageJson, 'v')
  })

  const pNameAntVersionPackages = nameAntVersionPackages.map(async (nameAntVersionPackage) => {
    return versionDiff(nameAntVersionPackage, git)
  })

  await Promise.all(pNameAntVersionPackages)

  const packagesMessage = getDiffCommitMessage(nameAntVersionPackages)

  // packages test
  const gitMessage = await getCommitMessage(git)
  expect(gitMessage).toBe(`${message}${packagesMessage}`)
}

export async function diffTestPackageList(arrFile: string[], newVersion: string, git: SimpleGit) {
  const packageJsonList = await getPackages(arrFile)
  const tagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
  await tagList
}

export async function diffTestPackage(filePath: string, newVersion: string, git: SimpleGit) {
  const json = await readJSON(filePath)
  await tagCommit(json, newVersion, git)
}
