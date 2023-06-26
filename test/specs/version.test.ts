import { readJSON } from 'fs-extra'
import type { SimpleGit } from 'simple-git'
import type { IPackageJson } from '@ts-type/package-dts'
import { commandVersion } from '../../src/index'
import { tagExpect } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/utils/git'
import type { SimpleGitTestContext } from '../__fixtures__'
import {
  handleCommand,

  newSimpleGit,
  setUpFilesAdded,
} from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
let context: SimpleGitTestContext
const prefix = 'version-test'

function getPackages (arr: string[]) {
  return Promise.all(arr.map(item => {
    return readJSON(`packages/${item}/package.json`)
  }))
}
async function tagCommit (arr: IPackageJson[], newVersion, git: SimpleGit) {
  const list = arr.map(async item => {
    const tagCommitId = await tagExpect(`${item.name}@${newVersion}`, git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  })
  await list
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
afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
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
  const [a, b] = await getPackages(arrFile)
  expect(a.version).toBe(newVersion)
  expect(b.version).toBe(newVersion)
  return git
}
const newVersion = '1.0.0'
const quarantine = 'quarantine'
describe(`${cmd}: ${quarantine}`, () => {
  const dirArr = ['a', 'b']
  test(`${quarantine}: default(sync)`, async () => {
    await syncTest(quarantine, dirArr, newVersion)
  })
  test(`${quarantine}`, async () => {
    const git = await diffTest(quarantine, dirArr, newVersion)

    await setUpFilesAdded(context, ['packages/b/test'])
    const addVersion = '1.1.0'
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aAdd, bAdd] = await getPackages(dirArr)
    expect(aAdd.version).toBe(newVersion)
    expect(bAdd.version).toBe(addVersion)
  })
})
const many = 'many'
describe(`${cmd}: ${many}`, () => {
  const dirArr = ['a', 'b', 'c', 'd', 'e']
  test(`${many}: default(sync)`, async () => {
    await syncTest(many, dirArr, newVersion)
  })
  // test(`${many}`, async () => {
  //   const newVersion = '1.0.0'
  //   const git = await diffTest(many, dirArr, newVersion)

  //   await setUpFilesAdded(context, ['packages/b/test'])
  //   const addVersion = '1.1.0'
  //   await commandVersion({
  //     mode: 'diff',
  //   }, git, addVersion)
  //   const [aAdd, bAdd] = await getPackages(dirArr)
  //   expect(aAdd.version).toBe(newVersion)
  //   expect(bAdd.version).toBe(addVersion)
  // })
})
