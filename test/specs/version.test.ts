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
describe(cmd, () => {
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
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  // test.only('default', async () => {
  //   const newVersion = '1.0.0'
  //   let git!: SimpleGit
  //   const { newCommitId } = await handleCommand(async function () {
  //     git = newSimpleGit(context.root)
  //     process.chdir(context.root)
  //     await commandVersion(undefined, git, newVersion)
  //     return git
  //   }, newVersion)

  //   const [a, b, c] = await getPackages()
  //   // git message test
  //   const gitMessage = await git.show([
  //     newCommitId,
  //     '-s',
  //   ])
  //   expect(gitMessage.includes('chore: version')).toBeTruthy()

  //   // version unchanged
  //   try {
  //     await commandVersion(undefined, git, newVersion)
  //   }
  //   catch (err) {
  //     expect(err.message).toBe(WARN_NOW_VERSION)
  //   }
  // }, 100000)
  test.only('root diff', async () => {
    const newVersion = '1.0.0'
    context = await handleCommand('quarantine', prefix)
    const git = newSimpleGit(context.root)
    process.chdir(context.root)
    await commandVersion({
      mode: 'diff',
    }, git, newVersion)

    // packages test
    const [a, b] = await getPackages(['a', 'b'])
    await tagCommit([a, b], newVersion, git)
    expect(a.version).toBe(newVersion)
    expect(b.version).toBe(newVersion)

    // add 1.1.0
    const addVersion = '1.1.0'
    await setUpFilesAdded(context, ['packages/b/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [addA, addB] = await getPackages(['a', 'b'])
    expect(addA.version).toBe(newVersion)
    expect(addB.version).toBe(addVersion)
  })

  // test(`root diff, ${cmd} sync`, async () => {
  //   const newVersion = '0.0.1'
  //   let git!: SimpleGit
  //   await handleCommand(async function () {
  //     git = newSimpleGit(context.root)
  //     process.chdir(context.root)
  //     await commandVersion({
  //       mode: 'diff',
  //       [cmd]: {
  //         mode: 'sync',
  //       },
  //     }, git, newVersion)
  //     return git
  //   })

  //   // packages test
  //   const tagCommitId = await tagExpect(`v${newVersion}`, git)
  //   const newCommitId = await getNewestCommitId(git)
  //   expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  //   const [a, b, c] = await getPackages()
  //   expect(a.version).toBe(newVersion)
  //   expect(b.version).toBe(newVersion)
  //   expect(b.dependencies['@test/a']).toBe('workspace:~0.0.0')
  //   expect(c.version).toBe(newVersion)
  //   expect(c.dependencies['@test/b']).toBe('workspace:^0.0.0')

  //   // git message test
  //   const gitMessage = await git.show([
  //     newCommitId,
  //     '-s',
  //   ])
  //   expect(gitMessage.includes('chore: test')).toBeTruthy()
  // })

  // test.only('message', async () => {
  //   const newVersion = '0.1.0-beta'
  //   const message = 'chore: test'
  //   let git!: SimpleGit
  //   await handleCommand(async function () {
  //     git = newSimpleGit(context.root)
  //     process.chdir(context.root)
  //     await commandVersion({
  //       [cmd]: {
  //         message,
  //       },
  //     }, git, newVersion)
  //     return git
  //   })

  //   // packages test
  //   const [a, b, c] = await getPackages()
  //   expect(a.version).toBe(newVersion)
  //   expect(b.version).toBe(newVersion)
  //   expect(b.dependencies['@test/a']).toBe(`workspace:~${newVersion}`)
  //   expect(c.version).toBe(newVersion)
  //   expect(c.dependencies['@test/b']).toBe('workspace:^0.0.0')

  //   // git message test
  //   const gitMessage = await git.show([
  //     newCommitId,
  //     '-s',
  //   ])
  //   expect(gitMessage.includes(message)).toBeTruthy()
  // }, 1000000)
})
