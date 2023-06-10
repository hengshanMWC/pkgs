import path from 'path'
import { copy, readJSON } from 'fs-extra'
import type { SimpleGit } from 'simple-git'
import { commandVersion } from '../../src/index'
import { tagExpect } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/utils/git'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
  setUpFilesAdded,
  createTestContext,
  setUpInit,
} from '../__fixtures__'
import { WARN_NOW_VERSION } from '../../src/constant'

const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
describe(cmd, () => {
  let context: SimpleGitTestContext
  const prefix = 'version-test'

  async function handleCommand (cd, newVersion: string, dir = 'single') {
    context = await createTestContext(prefix, dir)

    process.chdir(context._root)
    await copy(path.resolve(__dirname, '../../examples', dir), dir)
    await setUpInit(context)

    const git = await cd()

    const packageJson = await readJSON('package.json')
    expect(packageJson.version).toBe(newVersion)

    const tagCommitId = await tagExpect('version', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
    return {
      newCommitId,
    }
  }
  function getPackages () {
    return Promise.all(['a', 'b', 'c'].map(item => {
      return readJSON(`packages/${item}/package.json`)
    }))
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    const newVersion = '1.0.0'
    let git!: SimpleGit
    const { newCommitId } = await handleCommand(async function () {
      git = newSimpleGit(context.root)
      process.chdir(context.root)
      await commandVersion(undefined, git, newVersion)
      return git
    }, newVersion)

    // git message test
    const gitMessage = await git.show([
      newCommitId,
      '-s',
    ])
    expect(gitMessage.includes('chore: version')).toBeTruthy()

    // version unchanged
    try {
      await commandVersion(undefined, git, newVersion)
    }
    catch (err) {
      expect(err.message).toBe(WARN_NOW_VERSION)
    }
  })
  test('root diff', async () => {
    const newVersion = '1.0.0'
    let git!: SimpleGit
    await handleCommand(async function () {
      git = newSimpleGit(context.root)
      process.chdir(context.root)
      await commandVersion({
        mode: 'diff',
      }, git, newVersion)
      return git
    }, newVersion, 'multiple')

    // packages test
    const [a, b, c] = await getPackages()
    expect(a.version).toBe(newVersion)
    expect(b.version).toBe(newVersion)
    expect(b.dependencies['@test/a']).toBe(`workspace:~${newVersion}`)
    expect(c.version).toBe(newVersion)
    expect(c.devDependencies['@test/a']).toBe('workspace:*')
    expect(c.dependencies['@test/b']).toBe(`workspace:^${newVersion}`)

    // add 1.1.0
    const addVersion = '1.1.0'
    await setUpFilesAdded(context, ['packages/b/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [addA, addB, addC] = await getPackages()
    expect(addA.version).toBe(newVersion)
    expect(addB.version).toBe(addVersion)
    expect(addB.dependencies['@test/a']).toBe(`workspace:~${newVersion}`)
    expect(addC.version).toBe(newVersion)
    expect(addC.dependencies['@test/b']).toBe(`workspace:^${newVersion}`)
    const packageJson = await readJSON('package.json')
    expect(packageJson.version).toBe(addVersion)
  })

  test(`root diff, ${cmd} sync`, async () => {
    const newVersion = '0.0.1'
    let git!: SimpleGit
    const { newCommitId } = await handleCommand(async function () {
      git = newSimpleGit(context.root)
      process.chdir(context.root)
      await commandVersion({
        mode: 'diff',
        [cmd]: {
          mode: 'sync',
        },
      }, git, newVersion)
      return git
    }, newVersion, 'multiple')

    // packages test
    const [a, b, c] = await getPackages()
    expect(a.version).toBe(newVersion)
    expect(b.version).toBe(newVersion)
    expect(b.dependencies['@test/a']).toBe('workspace:~0.0.0')
    expect(c.version).toBe(newVersion)
    expect(c.dependencies['@test/b']).toBe('workspace:^0.0.0')

    // git message test
    const gitMessage = await git.show([
      newCommitId,
      '-s',
    ])
    expect(gitMessage.includes('chore: test')).toBeTruthy()
  })

  test('message', async () => {
    const newVersion = '0.1.0-beta'
    const message = 'chore: test'
    let git!: SimpleGit
    const { newCommitId } = await handleCommand(async function () {
      git = newSimpleGit(context.root)
      process.chdir(context.root)
      await commandVersion({
        [cmd]: {
          message,
        },
      }, git, newVersion)
      return git
    }, newVersion, 'multiple')

    // packages test
    const [a, b, c] = await getPackages()
    expect(a.version).toBe(newVersion)
    expect(b.version).toBe(newVersion)
    expect(b.dependencies['@test/a']).toBe(`workspace:~${newVersion}`)
    expect(c.version).toBe(newVersion)
    expect(c.dependencies['@test/b']).toBe('workspace:^0.0.0')

    // git message test
    const gitMessage = await git.show([
      newCommitId,
      '-s',
    ])
    expect(gitMessage.includes(message)).toBeTruthy()
  })
})
