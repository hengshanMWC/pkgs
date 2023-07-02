import type { SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import { commandVersion } from '../../src/index'
import { getPackages, tagExpect } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/utils/git'
import type { SimpleGitTestContext } from '../__fixtures__'
import {
  handleCommand,
  newSimpleGit,
  setUpFilesAdded,
} from '../__fixtures__'
import { Interdependence, addVersion, many, newVersion, quarantine } from '../__fixtures__/constant'

const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
let context: SimpleGitTestContext
const prefix = 'version-test'

async function tagCommit (packageJson: IPackageJson, version, git: SimpleGit) {
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

async function syncTest (dir: string, arrFile: string[], newVersion: string) {
  const message = 'chore: test'
  context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({
    [cmd]: {
      message: `${message} %s`,
    },
  }, git, newVersion)

  // packages test
  const arr = await getPackages(arrFile)
  await syncVersionDiff(newVersion, git)
  arr.forEach(({ version }) => expect(version).toBe(newVersion))
  const gitMessage = await getCommitMessage(git)
  expect(gitMessage).toBe(`${message} v${newVersion}`)
  return git
}
async function diffTest (dir: string, arrFile: string[], newVersion: string) {
  context = await handleCommand(dir, prefix)
  const git = newSimpleGit(context.root)
  process.chdir(context.root)
  await commandVersion({
    mode: 'diff',
  }, git, newVersion)
  const packageJsonList = await getPackages(arrFile)
  const tagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
  await tagList
  return git
}
afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
describe(`${cmd}: ${quarantine}`, () => {
  const dirArr = ['a', 'b']
  test(`${quarantine}: default(sync)`, async () => {
    await syncTest(quarantine, dirArr, newVersion)
  })
  test(`${quarantine}`, async () => {
    const git = await diffTest(quarantine, dirArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson] = await getPackages(dirArr)
    tagCommit(aPackageJson, addVersion, git)
    tagCommit(bPackageJson, newVersion, git)
  })
})
describe(`${cmd}: ${many}`, () => {
  const dirArr = ['a', 'b', 'c', 'd', 'e']
  test(`${many}: default(sync)`, async () => {
    await syncTest(many, dirArr, newVersion)
  })
  test(`${many}`, async () => {
    const git = await diffTest(many, dirArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const packageJsonList = await getPackages(dirArr)
    const abPackageJson = packageJsonList.splice(0, 2)
    const abPackageJsonTagList = abPackageJson.map(packageJson => tagCommit(packageJson, addVersion, git))
    const cdePackageJsonTagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
    await abPackageJsonTagList
    await cdePackageJsonTagList
  })
})
describe(`${cmd}: ${Interdependence}`, () => {
  const dirArr = ['a', 'b', 'c']
  test(`${Interdependence}: default(sync)`, async () => {
    await syncTest(Interdependence, dirArr, newVersion)
  })
  test(`${Interdependence}`, async () => {
    const git = await diffTest(Interdependence, dirArr, newVersion)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson, cPackageJson] = await getPackages(dirArr)
    await tagCommit(aPackageJson, addVersion, git)
    await tagCommit(bPackageJson, newVersion, git)
    await tagCommit(cPackageJson, addVersion, git)
  }, 10000000)
})
