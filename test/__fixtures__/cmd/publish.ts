import type IPackageJson from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import { readJSON } from 'fs-extra'
import { getPackages, tagExpect } from '../commit'
import { getNewestCommitId, getVersionTag } from '../../../src/utils/git'
import { handleCommand } from '../create-test-context'
import { newSimpleGit } from '../instance'
import { commandPublish, commandVersion } from '../../../src'
import { createGit, createName } from './version'
const prefix = 'publish-test'
export const cmd = 'publish'

export async function tagCommit (version: string, git: SimpleGit) {
  const tagCommitId = await tagExpect(version, git)
  expect(tagCommitId).not.toBeUndefined()
}

export async function syncTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({}, git, version)
  const { analysisBlockList } = await commandPublish({}, git)
  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
  })
  await tagCommit(version, git)
}

export async function diffTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({
    mode: 'diff',
  }, git, version)
  const { analysisBlockList } = await commandPublish({
    mode: 'diff',
  }, git)
  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
  })

  const nameAntVersionPackages = analysisBlockList.map(analysisBlock => {
    const packageJson = analysisBlock.packageJson
    return tagCommit(`${packageJson.name}@${version}`, git)
  })
  await Promise.all(nameAntVersionPackages)
}
