import path from 'path'
import fs from 'fs-extra'
import type { SimpleGit } from 'simple-git'
import { executeCommand } from '../../index'
import { tagExpect, fillgit } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/git'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
  io,
} from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
describe(cmd, () => {
  let context: SimpleGitTestContext
  let _path: string

  async function handleCommand (cd, newVersion: string, dir = 'single') {
    const mkdtemPath = await io.mkdtemp('version-test')
    process.chdir(mkdtemPath)
    _path = path.join(mkdtemPath, dir)
    await fs.copy(path.resolve(__dirname, '../temp', dir), dir)

    const git = await cd()

    const packageJson = await fs.readJSON('package.json')
    expect(packageJson.version).toBe(newVersion)

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
    return {
      newCommitId,
    }
  }
  function getPackages () {
    return Promise.all(['a', 'b', 'c'].map(item => {
      return fs.readJSON(`packages/${item}/package.json`)
    }))
  }
  beforeEach(async () => {
    context = await fillgit()
  })
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    const newVersion = '1.0.0'
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, undefined, git, newVersion)
      return git
    }, newVersion)
  })
  test('root diff', async () => {
    const newVersion = '1.0.0'
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
        mode: 'diff',
      }, git, newVersion)
      return git
    }, newVersion, 'multiple')

    const [a, b, c] = await getPackages()
    expect(a.version).toBe(newVersion)
    expect(b.version).toBe(newVersion)
    expect(b.dependencies['@test/a']).toBe(`workspace:~${newVersion}`)
    expect(c.version).toBe(newVersion)
    expect(c.devDependencies['@test/a']).toBe('workspace:*')
    expect(c.dependencies['@test/b']).toBe(`workspace:^${newVersion}`)
  })

  test(`root diff, ${cmd} sync`, async () => {
    const newVersion = '1.0.0'
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
        mode: 'diff',
        [cmd]: {
          mode: 'sync',
        },
      }, git, newVersion)
      return git
    }, newVersion)
  })

  test('message', async () => {
    const newVersion = '0.1.0'
    const message = 'chore: test'
    let git: SimpleGit
    const { newCommitId } = await handleCommand(async function () {
      git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
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
