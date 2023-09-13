import type { SimpleGit } from 'simple-git'
import { tagExpect } from '../commit'
import { parseCommandPublish, commandVersion } from '../../../src'
import { createName } from './version'
export const cmd = 'publish'

export async function tagCommit (version: string, git: SimpleGit) {
  const tagCommitId = await tagExpect(version, git)
  expect(tagCommitId).not.toBeUndefined()
}

export async function syncTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({}, git, version)
  const context = await parseCommandPublish({}, git)
  const { analysisBlockList } = context.getCommandResult()
  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
  })
  await tagCommit(version, git)
}

export async function diffTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({
    mode: 'diff',
  }, git, version)
  const context = await parseCommandPublish({
    mode: 'diff',
  }, git)
  const { analysisBlockList } = context.getCommandResult()
  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
  })

  const nameAntVersionPackages = analysisBlockList.map(analysisBlock => {
    const packageJson = analysisBlock.packageJson
    return tagCommit(`${packageJson.name}@${version}`, git)
  })
  await Promise.all(nameAntVersionPackages)
}
