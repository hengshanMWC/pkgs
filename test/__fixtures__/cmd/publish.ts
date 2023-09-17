import type { SimpleGit } from 'simple-git'
import { tagExpect } from '../commit'
import type { CommandResult } from '../../../src'
import {
  parseCommandPublish,
  commandVersion,
  createGitTagPackageListCommand,
  createGitTagPackageCommand,
} from '../../../src'
import { getPublishCommand } from '../utils'
import { GitExecuteTask, SerialExecuteManage } from '../../../src/execute'
import { createName } from './version'
export const cmd = 'publish'

export async function tagCommit (version: string, git: SimpleGit) {
  const tagCommitId = await tagExpect(version, git)
  expect(tagCommitId).not.toBeUndefined()
}

export async function syncTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({}, git, version)
  const context = await parseCommandPublish({}, git)
  const analysisBlockList = context.affectedAnalysisBlockList
  const commandResult: CommandResult<any>[] = []
  analysisBlockList.forEach((analysisBlock, index) => {
    expect(analysisBlock.packageJson.name).toBe(createName(arr[index]))
    // pnpm publish
    commandResult.push(getPublishCommand(analysisBlock.dir, version))
  })

  // git tag
  const gitTagCommand = createGitTagPackageListCommand({
    version,
    packageJsonList: analysisBlockList.map(item => item.packageJson),
    separator: '',
  })
  commandResult.push(gitTagCommand)
  const commandData = context.execute.getCommandData()
  commandData.forEach((item, index) => {
    expect(item).toEqual(commandResult[index])
  })
  const gitTag = new GitExecuteTask(gitTagCommand)
  await gitTag.run()
  await tagCommit(version, git)
}

export async function diffTest (version: string, arr: string[], git: SimpleGit) {
  await commandVersion({
    mode: 'diff',
  }, git, version)
  const context = await parseCommandPublish({
    mode: 'diff',
  }, git)
  const analysisBlockList = context.affectedAnalysisBlockList
  const commandResult: CommandResult<any>[] = []
  const taskList = new SerialExecuteManage()
  const nameAntVersionPackages: Array<() => Promise<void>> = []

  analysisBlockList.forEach((analysisBlock, index) => {
    const packageJson = analysisBlock.packageJson
    expect(packageJson.name).toBe(createName(arr[index]))
    commandResult.push(getPublishCommand(analysisBlock.dir, version))
    const gitTagCommand = createGitTagPackageCommand({
      packageJson,
      separator: '',
    })
    commandResult.push(gitTagCommand)
    const gitTag = new GitExecuteTask(gitTagCommand)
    taskList.pushTask(gitTag)
    nameAntVersionPackages.push(() => tagCommit(`${packageJson.name}@${version}`, git))
  })

  const commandData = context.execute.getCommandData()
  commandData.forEach((item, index) => {
    expect(item).toEqual(commandResult[index])
  })
  await taskList.run()
  await Promise.all(nameAntVersionPackages.map(func => func()))
}
